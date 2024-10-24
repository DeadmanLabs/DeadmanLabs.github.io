## Overview

So I recently noticed that there are a lot of crypto influencers that are posting wallet screenshots that they use to gain credability. These "influencers" post seemingly every few hours which led me to believe they were bot accounts, but that wasn't what I was concerned about. These accounts use the same wallet, and never post any information regarding their address that could be used to verify their trades on-chain.

```
https://x.com/idrawline/status/1847397034275344575
https://x.com/0xRamonos/status/1849243542830596367
https://x.com/0xRamonos/status/1848778955723313266
https://x.com/investminter/status/1848814591310245937
```

This caused me to start questioning the wallet software itself, Phantom wallet. My first instinct was to use a custom RPC server to manipulate the calls, but Phantom actually refuses to grab pricing data and displays a warning when using a custom RPC, so that wasn't it. So I moved on to plan B

## Technologies Used:

Making this quick and dirty solution was simple. Use a proxy to intercept the communication, reverse the communication, write rules to manipulate the response data, and show off our billions of dollars. Below is our stack

- mitmproxy
- python

thats all. 

## Setup:

### Step 1
Setting up the [mitmproxy](https://mitmproxy.org/). This consisted of using the installer, then grabbing the newly created SSL certificate and adding it to our list of trusted certificates. Note: Some browsers have a seperate list of trusted certificates from the OS, but mine did not so I added it to my OS list. 

### Step 2
Once mitmproxy was running, I wanted to route my traffic through it to start reversing how the wallet was communicating.

![Wallet Boot](/Posts/42c20ff1-a62f-40dd-bec8-b18fed2caa9d/API_boot.png)

Already when we boot we can see the wallet communicating with a few backend services. I do plan on reversing these later, but for now we are looking for communications AFTER we have authenticated.

![Wallet Healthcheck](/Posts/42c20ff1-a62f-40dd-bec8-b18fed2caa9d/PostCommunication.png)

Now we can see that after we have communicated with the API, we perform a healthcheck, then start grabbing some info. Lets take a closer look at these calls

![Price Request](/Posts/42c20ff1-a62f-40dd-bec8-b18fed2caa9d/PricesReq.png)
![Price Response](/Posts/42c20ff1-a62f-40dd-bec8-b18fed2caa9d/PricesRes.png)

Ok, we can see that prices is a simple call to get the price of the requested assets, as well as the 24h change. This would allow us to manipulate the price of an asset locally without any warnings, however, that isn't very helpful for faking our balance, as users could easily check the price of the asset and see that it never got anywhere near what our wallet claims. But lets check the tokens call.

![Tokens Request](/Posts/42c20ff1-a62f-40dd-bec8-b18fed2caa9d/TokensReq.png)
![Tokens Response](/Posts/42c20ff1-a62f-40dd-bec8-b18fed2caa9d/TokensRes.png)

Excellent! We can see that /tokens responds with not only the token information, but also the amount that we own.

## Reversing:
Now that we know the structures of the calls that the wallet is going to make, we can build a script to easily add rules to change the balances of the wallet.

```py
from mitmproxy import http, ctx
import json
import threading
import datetime
import os
import time

class TokenManagerCLI:
    def __init__(self):
        self.target_url_path = "/tokens/v1"
        self.target_host = "api.phantom.app"
        self.true_values = {}
        self.rules = {}
        self.new_tokens = []
        self.log_filename = 'mitmproxy-' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S') + '.log'
        self.log_file_path = os.path.join(os.getcwd(), self.log_filename)

        # Suppress mitmproxy messages
        ctx.log.warn = self.null_log
        ctx.log.info = self.null_log
        ctx.log.error = self.null_log

        # Start the CLI in a separate thread
        cli_thread = threading.Thread(target=self.run_cli, daemon=True)
        cli_thread.start()

    def null_log(self, *args, **kwargs):
        # Function to suppress mitmproxy logs
        pass

    def log_to_file(self, message):
        with open(self.log_file_path, "a", encoding="utf-8") as log_file:
            log_file.write(message + "\n")

    def run_cli(self):
        while True:
            print("\nToken Manager CLI")
            print("1. Add Rule")
            print("2. Add Token")
            print("3. Remove Rule")
            print("4. Remove Token")
            print("5. View Rules and Tokens")
            print("6. View True Token List")
            print("7. Export Ruleset")
            print("8. Import Ruleset")
            print("9. Exit")
            choice = input("Enter your choice: ")

            if choice == '1':
                self.add_rule()
            elif choice == '2':
                self.add_token()
            elif choice == '3':
                self.remove_rule()
            elif choice == '4':
                self.remove_token()
            elif choice == '5':
                self.view_rules_and_tokens()
            elif choice == '6':
                self.view_true_token_list()
            elif choice == '7':
                self.export_ruleset()
            elif choice == '8':
                self.import_ruleset()
            elif choice == '9':
                print("Exiting Token Manager CLI.")
                break
            else:
                print("Invalid choice. Please try again.")

            # Small delay to prevent high CPU usage
            time.sleep(0.1)

    def add_rule(self):
        if not self.true_values:
            print("No true token data available yet. Please wait for a response to be intercepted.")
            return

        token_list = self.get_token_list()
        if not token_list:
            print("No tokens available to modify.")
            return

        print("\nSelect a token to modify:")
        for idx, token in enumerate(token_list):
            print(f"{idx + 1}. {token['type']} - {token['data'].get('name', '')}")

        try:
            selection = int(input("Enter the number of the token: ")) - 1
            if selection < 0 or selection >= len(token_list):
                print("Invalid selection.")
                return
        except ValueError:
            print("Invalid input.")
            return

        token_type = token_list[selection]['type']
        amount_str = input("Enter the amount to add/remove: ")
        try:
            amount = int(amount_str)
            self.rules[token_type] = self.rules.get(token_type, 0) + amount
            self.log_to_file(f"Rule added: {token_type} amount change {amount}")
            print(f"Rule added: {token_type} amount change {amount}")
        except ValueError:
            print("Invalid amount. Please enter an integer.")

    def add_token(self):
        if not self.true_values:
            print("No true token data available yet. Please wait for a response to be intercepted.")
            return

        token_list = self.get_token_list()
        print("\nSelect a token to add as new or enter 'N' to create a new token manually:")
        for idx, token in enumerate(token_list):
            print(f"{idx + 1}. {token['type']} - {token['data'].get('name', '')}")
        print("N. Create a new token manually")

        selection = input("Enter your choice: ")
        if selection.upper() == 'N':
            # Manually add a new token
            token_type = input("Enter the new token type: ")
            if token_type:
                amount_str = input("Enter the amount for the new token: ")
                try:
                    amount = int(amount_str)
                    token_data = {
                        "type": token_type,
                        "data": {
                            "amount": str(amount),
                            "name": token_type,
                            "symbol": token_type[:3].upper(),
                            "decimals": 0,
                            "chain": {
                                "id": "custom",
                                "name": "Custom Chain",
                                "symbol": token_type[:3].upper(),
                                "imageUrl": ""
                            },
                            "logoUri": "",
                            "spamStatus": "VERIFIED"
                        }
                    }
                    self.new_tokens.append(token_data)
                    self.log_to_file(f"New token added: {token_type} with amount {amount}")
                    print(f"New token added: {token_type} with amount {amount}")
                except ValueError:
                    print("Invalid amount. Please enter an integer.")
        else:
            # Add token from the true list
            try:
                idx = int(selection) - 1
                if idx < 0 or idx >= len(token_list):
                    print("Invalid selection.")
                    return
                amount_str = input("Enter the amount for the new token: ")
                try:
                    amount = int(amount_str)
                    token_data = token_list[idx].copy()
                    token_data['data'] = token_data['data'].copy()
                    token_data['data']['amount'] = str(amount)
                    self.new_tokens.append(token_data)
                    token_type = token_data['type']
                    self.log_to_file(f"New token added from true list: {token_type} with amount {amount}")
                    print(f"New token added from true list: {token_type} with amount {amount}")
                except ValueError:
                    print("Invalid amount. Please enter an integer.")
            except ValueError:
                print("Invalid input.")
                return

    def remove_rule(self):
        if not self.rules:
            print("No rules to remove.")
            return

        print("\nCurrent Rules:")
        for idx, (token_type, amount) in enumerate(self.rules.items()):
            print(f"{idx + 1}. Rule: {token_type} change {amount}")

        try:
            selection = int(input("Enter the number of the rule to remove: ")) - 1
            if selection < 0 or selection >= len(self.rules):
                print("Invalid selection.")
                return
            token_type = list(self.rules.keys())[selection]
            removed_amount = self.rules.pop(token_type)
            self.log_to_file(f"Rule removed: {token_type} amount change {removed_amount}")
            print(f"Rule removed: {token_type} amount change {removed_amount}")
        except ValueError:
            print("Invalid input.")
            return

    def remove_token(self):
        if not self.new_tokens:
            print("No new tokens to remove.")
            return

        print("\nNew Tokens:")
        for idx, token in enumerate(self.new_tokens):
            print(f"{idx + 1}. New Token: {token['type']} amount {token['data']['amount']}")

        try:
            selection = int(input("Enter the number of the token to remove: ")) - 1
            if selection < 0 or selection >= len(self.new_tokens):
                print("Invalid selection.")
                return
            removed_token = self.new_tokens.pop(selection)
            token_type = removed_token['type']
            self.log_to_file(f"New token removed: {token_type}")
            print(f"New token removed: {token_type}")
        except ValueError:
            print("Invalid input.")
            return

    def view_rules_and_tokens(self):
        print("\nCurrent Rules:")
        for token_type, amount in self.rules.items():
            print(f"Rule: {token_type} change {amount}")
        print("\nNew Tokens:")
        for token in self.new_tokens:
            print(f"New Token: {token['type']} amount {token['data']['amount']}")

    def view_true_token_list(self):
        if not self.true_values:
            print("No true token data available yet. Please wait for a response to be intercepted.")
            return
        token_list = self.get_token_list()
        print("\nTrue Token List:")
        for idx, token in enumerate(token_list):
            print(f"{idx + 1}. {token['type']} - {token['data'].get('name', '')} amount {token['data'].get('amount', '')}")

    def export_ruleset(self):
        if not self.rules and not self.new_tokens:
            print("No rules or new tokens to export.")
            return

        # Create 'rules' directory if it doesn't exist
        rules_dir = os.path.join(os.getcwd(), 'rules')
        if not os.path.exists(rules_dir):
            os.makedirs(rules_dir)

        # Prepare data to export
        export_data = {
            'rules': self.rules,
            'new_tokens': self.new_tokens
        }

        # Generate filename with current datetime
        filename = datetime.datetime.now().strftime('%Y%m%d-%H%M%S') + '.rules'
        filepath = os.path.join(rules_dir, filename)

        # Save to file
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=4)
            print(f"Ruleset exported to {filepath}")
            self.log_to_file(f"Ruleset exported to {filepath}")
        except Exception as e:
            print(f"Error exporting ruleset: {str(e)}")
            self.log_to_file(f"Error exporting ruleset: {str(e)}")

    def import_ruleset(self):
        # Look for .rules files in 'rules' directory
        rules_dir = os.path.join(os.getcwd(), 'rules')
        if not os.path.exists(rules_dir):
            print("No 'rules' directory found. No rulesets to import.")
            return

        rules_files = [f for f in os.listdir(rules_dir) if f.endswith('.rules')]
        if not rules_files:
            print("No .rules files found in 'rules' directory.")
            return

        print("\nAvailable Rulesets:")
        for idx, filename in enumerate(rules_files):
            print(f"{idx + 1}. {filename}")

        try:
            selection = int(input("Enter the number of the ruleset to import: ")) - 1
            if selection < 0 or selection >= len(rules_files):
                print("Invalid selection.")
                return
            filepath = os.path.join(rules_dir, rules_files[selection])

            # Load ruleset from file
            with open(filepath, 'r', encoding='utf-8') as f:
                import_data = json.load(f)

            self.rules = import_data.get('rules', {})
            self.new_tokens = import_data.get('new_tokens', [])

            print(f"Ruleset imported from {filepath}")
            self.log_to_file(f"Ruleset imported from {filepath}")
        except ValueError:
            print("Invalid input.")
        except Exception as e:
            print(f"Error importing ruleset: {str(e)}")
            self.log_to_file(f"Error importing ruleset: {str(e)}")

    def get_token_list(self):
        return self.true_values.get('tokens', [])

    def request(self, flow: http.HTTPFlow) -> None:
        pass  # No modifications to requests

    def response(self, flow: http.HTTPFlow) -> None:
        if flow.request.host == self.target_host and flow.request.path == self.target_url_path:
            # Log the original response
            self.log_to_file("----- Original Response -----")
            self.log_to_file(flow.response.get_text())

            # Parse the response content as JSON
            data = json.loads(flow.response.get_text())

            # Store the true values
            self.true_values = data.copy()

            # Apply modifications based on rules
            for token in data.get('tokens', []):
                token_type = token.get('type')
                # Modify existing tokens based on rules
                if token_type in self.rules:
                    amount_str = token['data']['amount']
                    new_amount = str(int(amount_str) + self.rules[token_type])
                    token['data']['amount'] = new_amount
                    self.log_to_file(f"Modified {token_type} amount to {new_amount}")

            # Add new tokens
            data['tokens'].extend(self.new_tokens)

            # Set the modified response
            flow.response.set_text(json.dumps(data))

            # Log the modified response
            self.log_to_file("----- Modified Response -----")
            self.log_to_file(flow.response.get_text())

addons = [
    TokenManagerCLI()
]
```

With the script we wrote, it becomes very simple for a Phantom user to manipulate their existing coins. I have also started writing the function to add tokens we dont even own, however that would require manually fetching the token metadata and adding it to the response. We can run the script with the command below

```sh
mitmweb -s script.py -p 8888
```

Then once added to the system proxy of the OS (or browser), we can start the script

![Start Script](/Posts/42c20ff1-a62f-40dd-bec8-b18fed2caa9d/ScriptRunning.png)

Then we open the wallet, which authenticates with the backend and requests the tokens and prices. Once we receive the response, the script keeps track of our true token counts, and allows us to modify them

![Adding Rule](/Posts/42c20ff1-a62f-40dd-bec8-b18fed2caa9d/NewRule.png)

Once modified, the next time the wallet refreshes the balances, our rule is applied and we have the new balance!

## Result:
Note: When adding rules, you must provide the balance in lamports, not in decimals. This means that since solana has 9 decimal places, the true value is: value * (10 ** 9)

So in the above example, we use 1000000000000000000 which is divided by 10 ** 9, which results in 1 billion Solana, which is greater than the current circulating supply of 470 million. Look mom, I'm rich!

![I'm Rich](/Posts/42c20ff1-a62f-40dd-bec8-b18fed2caa9d/InsaneBalance.png)

## Utility:
In terms of value, the money is fake. Attempting to send funds to other wallets would result a rejection from the chain, as it has access to the true data. This does however highlight an issue in the cryptocurrency space. First of all, taking advice due to an individual having lots of money can never end well. This has been known for YEARS but for some reason goes over the heads of most cryptocurrency traders. Second, a catchphrase for many cryptocurrencies is "Be your own bank", but everyday working individuals have no idea how scary that idea can be. Banks have millions to spend on security, and they still get hacked sometimes. That risk goes way up for everyday people, as they dont have the security budget needed to keep their funds safe, even at the higher levels. A malware sample that has sufficient permissions to install an SSL certificate would result in complete manipulation of your wallet balances, pricing, data, etc.

In terms of how to resolve this, Phantom could make some checks, but in my opinion, just the knowledge that the wallet can be manipulated should be enough to prevent any serious damange from occuring due to this "exploit" (if you can even call it that)