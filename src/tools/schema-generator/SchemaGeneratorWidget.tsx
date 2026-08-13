"use client";
import React, { useState } from 'react';

export default function SchemaGeneratorWidget({ locale }: { locale: string }) {
  const [tab, setTab] = useState<'FAQ' | 'Article' | 'Person'>('FAQ');
  
  // FAQ State
  const [faqQuestions, setFaqQuestions] = useState([{ question: '', answer: '' }]);
  
  // Article State
  const [articleHead, setArticleHead] = useState('');
  const [articleAuthor, setArticleAuthor] = useState('');
  
  // Person State
  const [personName, setPersonName] = useState('');
  const [personJob, setPersonJob] = useState('');
  
  const generateSchema = () => {
    let schema: any = {};
    if (tab === 'FAQ') {
      schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqQuestions.filter(q => q.question && q.answer).map(q => ({
          "@type": "Question",
          "name": q.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": q.answer
          }
        }))
      };
    } else if (tab === 'Article') {
      schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": articleHead,
        "author": {
          "@type": "Person",
          "name": articleAuthor
        }
      };
    } else if (tab === 'Person') {
      schema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": personName,
        "jobTitle": personJob
      };
    }
    
    return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
  };

  return (
    <div className="p-6 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-white shadow-xl max-w-4xl mx-auto">
      <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
        {['FAQ', 'Article', 'Person'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${tab === t ? 'bg-indigo-500/30 border border-indigo-500/50' : 'hover:bg-white/5'}`}
          >
            {t}
          </button>
        ))}
      </div>
      
      <div className="space-y-4 mb-6">
        {tab === 'FAQ' && (
          <div className="space-y-4">
            {faqQuestions.map((q, idx) => (
              <div key={idx} className="space-y-2 p-4 bg-black/20 rounded-lg border border-white/5">
                <input
                  type="text"
                  placeholder="Question"
                  value={q.question}
                  onChange={(e) => {
                    const newFaq = [...faqQuestions];
                    newFaq[idx].question = e.target.value;
                    setFaqQuestions(newFaq);
                  }}
                  className="w-full bg-black/30 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:border-indigo-500/50"
                />
                <textarea
                  placeholder="Answer"
                  value={q.answer}
                  onChange={(e) => {
                    const newFaq = [...faqQuestions];
                    newFaq[idx].answer = e.target.value;
                    setFaqQuestions(newFaq);
                  }}
                  className="w-full bg-black/30 border border-white/10 rounded-md p-2 text-sm focus:outline-none focus:border-indigo-500/50 h-24"
                />
              </div>
            ))}
            <button
              onClick={() => setFaqQuestions([...faqQuestions, { question: '', answer: '' }])}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm transition-colors"
            >
              + Add Question
            </button>
          </div>
        )}
        
        {tab === 'Article' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Headline"
              value={articleHead}
              onChange={(e) => setArticleHead(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-md p-2 focus:outline-none focus:border-indigo-500/50"
            />
            <input
              type="text"
              placeholder="Author Name"
              value={articleAuthor}
              onChange={(e) => setArticleAuthor(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-md p-2 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        )}
        
        {tab === 'Person' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-md p-2 focus:outline-none focus:border-indigo-500/50"
            />
            <input
              type="text"
              placeholder="Job Title"
              value={personJob}
              onChange={(e) => setPersonJob(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-md p-2 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-3">Generated JSON-LD</h3>
        <textarea
          readOnly
          value={generateSchema()}
          className="w-full bg-black/40 border border-indigo-500/30 rounded-lg p-4 font-mono text-sm h-64 focus:outline-none text-indigo-200"
        />
      </div>
    </div>
  );
}
