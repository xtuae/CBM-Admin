import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RichTextDisplay } from '../components/RichTextEditor';

interface Page {
  id: string;
  slug: string;
  title: string;
  content?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  created_at: string;
  updated_at: string;
}

// Simple Markdown-like parser (basic implementation)
const parseMarkdown = (content: string): React.ReactElement => {
  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headers
    if (line.startsWith('# ')) {
      elements.push(<h1 key={key++} className="text-3xl font-bold text-gray-900 mb-6 mt-8 first:mt-0">{line.substring(2)}</h1>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={key++} className="text-2xl font-semibold text-gray-900 mb-4 mt-6">{line.substring(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={key++} className="text-xl font-semibold text-gray-900 mb-3 mt-5">{line.substring(4)}</h3>);
    }
    // Lists
    else if (line.startsWith('- ')) {
      elements.push(<li key={key++} className="mb-2">{parseInlineMarkdown(line.substring(2))}</li>);
    } else if (line.startsWith('* ') && !line.startsWith('**')) {
      elements.push(<li key={key++} className="mb-2">{parseInlineMarkdown(line.substring(2))}</li>);
    }
    // Numbered lists (simple implementation)
    else if (/^\d+\. /.test(line)) {
      const match = line.match(/^(\d+)\. (.+)/);
      if (match) {
        elements.push(<li key={key++} className="mb-2">{parseInlineMarkdown(match[2])}</li>);
      }
    }
    // Empty lines create paragraph breaks
    else if (line.trim() === '') {
      if (elements.length > 0 && elements[elements.length - 1]) {
        // Add margin bottom to last element
      }
    }
    // Regular paragraphs
    else if (line.trim()) {
      elements.push(<p key={key++} className="mb-4 text-gray-700 leading-relaxed">{parseInlineMarkdown(line)}</p>);
    }
  }

  return <div className="prose prose-lg max-w-none">{elements}</div>;
};

// Simple inline markdown parser
const parseInlineMarkdown = (text: string): React.ReactElement | string => {
  // Handle links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800">$1</a>');

  // Handle bold **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');

  // Handle italic *text*
  text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic">$1</em>');

  // If no HTML was added, return plain text
  if (!text.includes('<a') && !text.includes('<strong') && !text.includes('<em')) {
    return text;
  }

  return <span dangerouslySetInnerHTML={{ __html: text }} />;
};

const DynamicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setError('Invalid page slug');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/v1/pages/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Page not found');
          } else {
            setError('Failed to load page');
          }
          setLoading(false);
          return;
        }

        const pageData = await response.json();
        setPage(pageData);
        setError(null);
      } catch (err) {
        console.error('Error fetching page:', err);
        setError('Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  // Set page title and meta tags
  useEffect(() => {
    if (page) {
      document.title = page.seo_title || `${page.title} - Credits Marketplace`;

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', page.seo_description || `Learn about ${page.title} on Credits Marketplace`);
      }

      // Update meta keywords
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', page.seo_keywords || `${page.slug}, ${page.title}, credits marketplace`);
      }
    }
  }, [page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {error === 'Page not found' ? 'Page Not Found' : 'Error Loading Page'}
            </h1>
            <p className="text-gray-600 mb-8">
              {error === 'Page not found'
                ? 'The page you\'re looking for doesn\'t exist.'
                : 'Sorry, we couldn\'t load the requested page.'
              }
            </p>
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/" className="hover:text-gray-700">Home</Link>
            </li>
            <li>/</li>
            <li className="text-gray-900">{page.title}</li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.title}</h1>
          {page.seo_description && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {page.seo_description}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          {page.content ? (
            <RichTextDisplay content={page.content} />
          ) : (
            <p className="text-gray-600 italic">No content available for this page.</p>
          )}
        </div>

        {/* Contact CTA for certain pages */}
        {['about', 'contact', 'terms-of-use', 'privacy-policy'].includes(page.slug) && (
          <div className="bg-blue-50 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {page.slug === 'contact' ? 'Need More Help?' : 'Have Questions?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {page.slug === 'contact'
                ? 'We\'re here to help with any additional questions or support you may need.'
                : 'We\'re here to help. Reach out to our team for support with your questions.'
              }
            </p>
            <Link
              to={page.slug === 'contact' ? '/' : '/contact'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200"
            >
              {page.slug === 'contact' ? 'Browse Marketplace' : 'Contact Us'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicPage;
