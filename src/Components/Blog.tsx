import React, { useState, useEffect } from 'react';
import { getAllPosts } from './utils/loadPosts';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import background from '../Resources/Backgrounds/BedTime.jpg';

interface Post {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  content: string;
  graphic: string;
}

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    author: '',
    title: '',
    subtitle: '',
    body: '',
    image: null as File | null,
  });

  useEffect(() => {
    const fetchPosts = async () => {
      const postsData = await getAllPosts();
      setPosts(postsData);
    };

    fetchPosts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    const zip = new JSZip();
    let overviewJson = { ...formData, date: new Date().toISOString() } as { [key: string]: any, body?: string };
    delete overviewJson.body;

    if (zip) {
      zip.file('overview.json', JSON.stringify(overviewJson, null, 2));
      zip.file('post.md', `${formData.body}`);

      if (formData.image) {
        zip.file('graphic.jpg', formData.image.name);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${uuidv4()}.zip`);
    setIsModalOpen(false);
  };

  return (
    <div className="relative flex flex-col flex-grow h-full bg-gray-900 text-white p-8" style={{ backgroundSize: 'cover', backgroundImage: `url(${background})` }}>
      <h1 className="text-4xl font-bold text-center mb-8">Blog</h1>
      <button
        className="absolute top-4 left-4 bg-green-500 text-white p-2 w-10 h-10 rounded-md hover:bg-green-700 flex items-center justify-center"
        onClick={() => setIsModalOpen(true)}
      >
        +
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <div key={post.id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <img src={`/src/Posts/${post.id}/${post.graphic}`} alt={post.title} className="w-full h-48 object-cover rounded-lg mb-4" />
            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
            <h3 className="text-xl mb-2">{post.subtitle}</h3>
            <p className="text-sm text-gray-400 mb-2">By {post.author} on {new Date(post.date).toLocaleDateString()}</p>
            <p className="text-gray-300">{post.content.substring(0, 100)}...</p>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white p-10 rounded-lg shadow-lg max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-white hover:text-gray-400"
              onClick={() => setIsModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Create a Blog Post</h2>
            <input
              type="text"
              name="author"
              placeholder="Author"
              value={formData.author}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg"
            />
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg"
            />
            <input
              type="text"
              name="subtitle"
              placeholder="Subtitle"
              value={formData.subtitle}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg"
            />
            <textarea
              name="body"
              placeholder="Body"
              value={formData.body}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg h-32"
            />
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg"
            />
            <button
              className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-700 w-full"
              onClick={handleSubmit}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;