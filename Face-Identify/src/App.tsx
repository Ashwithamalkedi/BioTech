import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/Toaster';
import Layout from './components/Layout';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Recognize from './pages/Recognize';
import Profiles from './pages/Profiles';
import { FaceRecognitionProvider } from './contexts/FaceRecognitionContext';

function App() {
  return (
    <FaceRecognitionProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recognize" element={<Recognize />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/profiles" element={<Profiles />} />
          </Routes>
        </Layout>
        <Toaster />
      </Router>
    </FaceRecognitionProvider>
  );
}

export default App;