import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError, WalletSignTransactionError } from '@solana/wallet-adapter-base';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Outlet, Link } from 'react-router-dom';

import './Styles/Blog.css';

const BlogItem = (props) => {
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);

    useEffect(() => {
        let active = true;
        load();
        return () => { active  = false }

        async function load() {
            setLoading(true);
            const response = fetch('https://localhost:3000/blog/image',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: props.id
                })
            });
            if (!active) { return; }
            setLoading(false);
        }
    }, []);

    return (
        <div className="blog-post" href={props.url}>
            <img src={ loading || image === null ? "../../public/Resources/Status/Loading.gif" : image} />
            <a>{props.name}</a>
            <a>{props.author}</a>
            <a>{props.date}</a>
        </div>
    );
}

const Blog = (props) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        let active = true;
        load();
        return () => { active = false }

        async function load() {
            setLoading(true);
            fetch('https://localhost:3000/blog/posts')
                .then(response => response.json())
                .then(data => setPosts(data.posts));
            if (!active) { return; }
            //...
            setLoading(false);
        }
    }, []);

    return (
        <div className="blog">
            {
                posts.map((value) => {
                    <BlogItem id={value.id} name={value.name} author={value.author} date={value.date} url={value.url} />
                })
            }
        </div>
    );
}

export default Blog;