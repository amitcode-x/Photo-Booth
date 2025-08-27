import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Download, RotateCcw, Sparkles, Palette, Sun, Moon, Zap, Heart, Star, Home, Image, Smile, Gift, Music, Crown, Flame, Coffee } from 'lucide-react';

const PhotoBooth = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const frameCanvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [selectedEffect, setSelectedEffect] = useState('none');
  const [selectedFrame, setSelectedFrame] = useState('none');
  const [currentPage, setCurrentPage] = useState('home');
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gallery, setGallery] = useState([]);

  const effects = [
    { id: 'none', name: 'Original', icon: Camera, filter: 'none' },
    { id: 'sepia', name: 'Vintage', icon: Sun, filter: 'sepia(100%)' },
    { id: 'grayscale', name: 'B&W', icon: Moon, filter: 'grayscale(100%)' },
    { id: 'blur', name: 'Dreamy', icon: Sparkles, filter: 'blur(2px)' },
    { id: 'saturate', name: 'Vibrant', icon: Palette, filter: 'saturate(200%)' },
    { id: 'contrast', name: 'Drama', icon: Zap, filter: 'contrast(150%)' },
    { id: 'hue', name: 'Rainbow', icon: Heart, filter: 'hue-rotate(90deg)' },
    { id: 'invert', name: 'Negative', icon: Star, filter: 'invert(100%)' },
    { id: 'warm', name: 'Warm', icon: Coffee, filter: 'sepia(30%) saturate(120%)' },
    { id: 'cool', name: 'Cool', icon: Flame, filter: 'hue-rotate(180deg) saturate(120%)' },
  ];

  const frames = {
    birthday: [
      { id: 'birthday1', name: 'Birthday Stars', category: 'birthday', color: 'from-yellow-400 to-orange-400' },
      { id: 'birthday2', name: 'Party Time', category: 'birthday', color: 'from-pink-400 to-red-400' },
      { id: 'birthday3', name: 'Cake & Balloons', category: 'birthday', color: 'from-purple-400 to-pink-400' },
      { id: 'birthday4', name: 'Confetti', category: 'birthday', color: 'from-rainbow' },
    ],
    wedding: [
      { id: 'wedding1', name: 'Elegant Gold', category: 'wedding', color: 'from-yellow-600 to-yellow-400' },
      { id: 'wedding2', name: 'Rose Garden', category: 'wedding', color: 'from-rose-400 to-pink-400' },
      { id: 'wedding3', name: 'Classic White', category: 'wedding', color: 'from-gray-100 to-white' },
      { id: 'wedding4', name: 'Royal Crown', category: 'wedding', color: 'from-purple-600 to-purple-400' },
    ],
    nature: [
      { id: 'nature1', name: 'Floral Border', category: 'nature', color: 'from-green-400 to-emerald-400' },
      { id: 'nature2', name: 'Sunset Glow', category: 'nature', color: 'from-orange-400 to-red-400' },
      { id: 'nature3', name: 'Forest Frame', category: 'nature', color: 'from-green-600 to-green-400' },
      { id: 'nature4', name: 'Ocean Waves', category: 'nature', color: 'from-blue-400 to-cyan-400' },
    ],
    fun: [
      { id: 'fun1', name: 'Neon Lights', category: 'fun', color: 'from-cyan-400 to-blue-400' },
      { id: 'fun2', name: 'Comic Style', category: 'fun', color: 'from-yellow-400 to-red-400' },
      { id: 'fun3', name: 'Disco Ball', category: 'fun', color: 'from-purple-400 to-pink-400' },
      { id: 'fun4', name: 'Retro Wave', category: 'fun', color: 'from-pink-400 to-purple-400' },
    ],
  };

  const pages = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'camera', name: 'Camera', icon: Camera },
    { id: 'frames', name: 'Frames', icon: Image },
    { id: 'gallery', name: 'Gallery', icon: Smile },
  ];

  const drawFrame = useCallback((canvas, frameId) => {
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Frame drawing logic
    switch (frameId) {
      case 'birthday1':
        // Birthday Stars frame
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 12;
        ctx.strokeRect(8, 8, width - 16, height - 16);
        // Inner border
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, width - 40, height - 40);
        // Draw stars around border
        ctx.fillStyle = '#FFD700';
        ctx.font = '30px Arial';
        for (let i = 0; i < 15; i++) {
          const x = 30 + Math.random() * (width - 60);
          const y = 50 + Math.random() * (height - 100);
          if (x < 80 || x > width - 80 || y < 80 || y > height - 80) {
            ctx.fillText('⭐', x, y);
          }
        }
        break;
        
      case 'birthday2':
        // Party Time frame
        ctx.strokeStyle = '#FF1493';
        ctx.lineWidth = 15;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        // Party text
        ctx.fillStyle = '#FF1493';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎉 PARTY TIME! 🎉', width/2, 50);
        ctx.fillText('🎊 CELEBRATE! 🎊', width/2, height - 20);
        ctx.textAlign = 'left';
        break;

      case 'birthday3':
        // Cake & Balloons
        ctx.strokeStyle = '#DA70D6';
        ctx.lineWidth = 10;
        ctx.strokeRect(12, 12, width - 24, height - 24);
        // Add decorations
        ctx.fillStyle = '#DA70D6';
        ctx.font = '25px Arial';
        // Balloons
        ctx.fillText('🎈🎈', 20, 50);
        ctx.fillText('🎈🎈', width - 80, 50);
        // Cake
        ctx.fillText('🎂', width/2 - 15, 50);
        ctx.fillText('🍰🧁', 20, height - 20);
        ctx.fillText('🍰🧁', width - 80, height - 20);
        break;

      case 'birthday4':
        // Confetti
        ctx.strokeStyle = '#FF6347';
        ctx.lineWidth = 8;
        ctx.strokeRect(15, 15, width - 30, height - 30);
        // Confetti particles
        const colors = ['#FF6347', '#FFD700', '#FF1493', '#00CED1', '#32CD32'];
        for (let i = 0; i < 50; i++) {
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          const x = Math.random() * width;
          const y = Math.random() * height;
          ctx.fillRect(x, y, 8, 8);
        }
        break;
        
      case 'wedding1':
        // Elegant Gold frame
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 16;
        ctx.strokeRect(8, 8, width - 16, height - 16);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 6;
        ctx.strokeRect(24, 24, width - 48, height - 48);
        // Corner decorations
        ctx.fillStyle = '#FFD700';
        ctx.font = '20px Arial';
        ctx.fillText('✨', 15, 35);
        ctx.fillText('✨', width - 35, 35);
        ctx.fillText('✨', 15, height - 15);
        ctx.fillText('✨', width - 35, height - 15);
        break;

      case 'wedding2':
        // Rose Garden
        ctx.strokeStyle = '#DC143C';
        ctx.lineWidth = 12;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        // Roses around border
        ctx.fillStyle = '#DC143C';
        ctx.font = '22px Arial';
        for (let i = 0; i < 12; i++) {
          const x = 30 + Math.random() * (width - 60);
          const y = 40 + Math.random() * (height - 80);
          if (x < 60 || x > width - 60 || y < 60 || y > height - 60) {
            ctx.fillText('🌹', x, y);
          }
        }
        break;

      case 'wedding3':
        // Classic White
        ctx.strokeStyle = '#F5F5F5';
        ctx.lineWidth = 20;
        ctx.strokeRect(5, 5, width - 10, height - 10);
        ctx.strokeStyle = '#E6E6FA';
        ctx.lineWidth = 8;
        ctx.strokeRect(25, 25, width - 50, height - 50);
        break;

      case 'wedding4':
        // Royal Crown
        ctx.strokeStyle = '#8A2BE2';
        ctx.lineWidth = 14;
        ctx.strokeRect(12, 12, width - 24, height - 24);
        ctx.fillStyle = '#8A2BE2';
        ctx.font = '25px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👑', width/2, 45);
        ctx.fillText('💎', 30, height/2);
        ctx.fillText('💎', width - 30, height/2);
        ctx.textAlign = 'left';
        break;
        
      case 'nature1':
        // Floral Border
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 10;
        ctx.strokeRect(12, 12, width - 24, height - 24);
        // Flowers and leaves
        ctx.fillStyle = '#228B22';
        ctx.font = '20px Arial';
        const flowers = ['🌸', '🌺', '🌻', '🍀', '🌿'];
        for (let i = 0; i < 20; i++) {
          const x = 25 + Math.random() * (width - 50);
          const y = 35 + Math.random() * (height - 70);
          if (x < 80 || x > width - 80 || y < 80 || y > height - 80) {
            const flower = flowers[Math.floor(Math.random() * flowers.length)];
            ctx.fillText(flower, x, y);
          }
        }
        break;

      case 'nature2':
        // Sunset Glow
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 12;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        // Gradient effect
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, 'rgba(255, 69, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 140, 0, 0.3)');
        ctx.fillStyle = gradient;
        ctx.fillRect(22, 22, width - 44, height - 44);
        break;

      case 'nature3':
        // Forest Frame
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 14;
        ctx.strokeRect(8, 8, width - 16, height - 16);
        ctx.fillStyle = '#228B22';
        ctx.font = '18px Arial';
        const trees = ['🌲', '🌳', '🍃'];
        for (let i = 0; i < 15; i++) {
          const x = 20 + Math.random() * (width - 40);
          const y = 30 + Math.random() * (height - 60);
          if (x < 60 || x > width - 60 || y < 60 || y > height - 60) {
            const tree = trees[Math.floor(Math.random() * trees.length)];
            ctx.fillText(tree, x, y);
          }
        }
        break;

      case 'nature4':
        // Ocean Waves
        ctx.strokeStyle = '#1E90FF';
        ctx.lineWidth = 12;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        // Wave pattern
        ctx.strokeStyle = '#00CED1';
        ctx.lineWidth = 4;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.moveTo(22, 30 + i * 20);
          for (let x = 22; x < width - 22; x += 20) {
            ctx.lineTo(x + 10, 40 + i * 20);
            ctx.lineTo(x + 20, 30 + i * 20);
          }
          ctx.stroke();
        }
        break;
        
      case 'fun1':
        // Neon Lights
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        ctx.strokeStyle = '#FF00FF';
        ctx.lineWidth = 4;
        ctx.strokeRect(18, 18, width - 36, height - 36);
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(26, 26, width - 52, height - 52);
        break;

      case 'fun2':
        // Comic Style
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.strokeRect(8, 8, width - 16, height - 16);
        // Comic bubbles
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('POW!', 20, 40);
        ctx.fillText('ZAP!', width - 70, height - 20);
        // Dots pattern
        ctx.fillStyle = '#FF0000';
        for (let i = 0; i < 30; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          if (x < 50 || x > width - 50 || y < 50 || y > height - 50) {
            ctx.fillRect(x, y, 4, 4);
          }
        }
        break;

      case 'fun3':
        // Disco Ball
        ctx.strokeStyle = '#8B008B';
        ctx.lineWidth = 10;
        ctx.strokeRect(12, 12, width - 24, height - 24);
        // Disco elements
        ctx.fillStyle = '#FFD700';
        ctx.font = '20px Arial';
        ctx.fillText('🕺', 25, 45);
        ctx.fillText('💃', width - 45, 45);
        ctx.fillText('🎵', 25, height - 25);
        ctx.fillText('🎶', width - 45, height - 25);
        // Sparkles
        ctx.fillStyle = '#FFFFFF';
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          ctx.fillText('✨', x, y);
        }
        break;

      case 'fun4':
        // Retro Wave
        ctx.strokeStyle = '#FF1493';
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, width - 20, height - 20);
        // Retro grid pattern
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        for (let i = 30; i < width - 30; i += 30) {
          ctx.beginPath();
          ctx.moveTo(i, 22);
          ctx.lineTo(i, height - 22);
          ctx.stroke();
        }
        for (let i = 30; i < height - 30; i += 30) {
          ctx.beginPath();
          ctx.moveTo(22, i);
          ctx.lineTo(width - 22, i);
          ctx.stroke();
        }
        break;
        
      default:
        // Default frame
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, width - 20, height - 20);
    }
  }, []);

  const startCamera = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by this browser');
      }

      let mediaStream;
      
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (err) {
        console.log('Trying basic constraints...');
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false
        });
      }
      
      if (videoRef.current && mediaStream) {
        videoRef.current.srcObject = mediaStream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setStream(mediaStream);
          setCameraStarted(true);
          setLoading(false);
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setLoading(false);
      
      let errorMessage = 'Camera access failed. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and refresh the page.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported by this browser.';
      } else {
        errorMessage += 'Please check your camera and try again.';
      }
      
      setError(errorMessage);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraStarted(false);
    }
  }, [stream]);

  const switchCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, [stopCamera]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const frameCanvas = frameCanvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Reset filter
    context.filter = 'none';
    
    // Apply effect
    const effect = effects.find(e => e.id === selectedEffect);
    if (effect && effect.filter !== 'none') {
      context.filter = effect.filter;
    }
    
    // Draw video
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Reset filter for frame drawing
    context.filter = 'none';
    
    // Apply frame if selected
    if (selectedFrame !== 'none') {
      frameCanvas.width = canvas.width;
      frameCanvas.height = canvas.height;
      drawFrame(frameCanvas, selectedFrame);
      
      // Composite frame onto photo
      context.globalCompositeOperation = 'source-over';
      context.drawImage(frameCanvas, 0, 0);
    }
    
    const photoData = canvas.toDataURL('image/png');
    setCapturedPhoto(photoData);
    
    // Add to gallery
    const newPhoto = {
      id: Date.now(),
      data: photoData,
      effect: selectedEffect,
      frame: selectedFrame,
      timestamp: new Date().toLocaleString()
    };
    setGallery(prev => [newPhoto, ...prev]);
    
    setTimeout(() => setIsCapturing(false), 300);
  }, [selectedEffect, selectedFrame, drawFrame]);

  const downloadPhoto = useCallback((photoData, filename) => {
    const link = document.createElement('a');
    link.download = filename || `photo-booth-${Date.now()}.png`;
    link.href = photoData;
    link.click();
  }, []);

  const downloadAllPhotos = useCallback(() => {
    gallery.forEach((photo, index) => {
      setTimeout(() => {
        downloadPhoto(photo.data, `photo-${index + 1}-${photo.timestamp.replace(/[/:]/g, '-')}.png`);
      }, index * 500);
    });
  }, [gallery, downloadPhoto]);

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
  }, []);

  const getFilterStyle = (effectId) => {
    const effect = effects.find(e => e.id === effectId);
    return effect ? { filter: effect.filter } : {};
  };

  useEffect(() => {
    if (facingMode && !cameraStarted && currentPage === 'camera') {
      startCamera();
    }
  }, [facingMode, startCamera, cameraStarted, currentPage]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const renderHomePage = () => (
    <div className="text-center space-y-8">
      <div className="mb-12">
        <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400 animate-pulse">
          📸 Photo Booth Pro
        </h1>
        <p className="text-xl text-gray-300 mb-8">Professional photo booth with amazing effects and frames</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-lg rounded-3xl p-6 border border-pink-500/20 hover:border-pink-400/40 transition-all duration-300 transform hover:scale-105">
          <Camera size={48} className="mx-auto mb-4 text-pink-400" />
          <h3 className="text-xl font-bold text-white mb-2">Smart Camera</h3>
          <p className="text-gray-300 text-sm">High-quality camera with auto-focus and smart settings</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-blue-600/20 backdrop-blur-lg rounded-3xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 transform hover:scale-105">
          <Sparkles size={48} className="mx-auto mb-4 text-purple-400" />
          <h3 className="text-xl font-bold text-white mb-2">10+ Effects</h3>
          <p className="text-gray-300 text-sm">Professional filters and effects for every mood</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-lg rounded-3xl p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 transform hover:scale-105">
          <Image size={48} className="mx-auto mb-4 text-blue-400" />
          <h3 className="text-xl font-bold text-white mb-2">Beautiful Frames</h3>
          <p className="text-gray-300 text-sm">16+ themed frames for every occasion</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-green-600/20 backdrop-blur-lg rounded-3xl p-6 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 transform hover:scale-105">
          <Download size={48} className="mx-auto mb-4 text-cyan-400" />
          <h3 className="text-xl font-bold text-white mb-2">Easy Download</h3>
          <p className="text-gray-300 text-sm">Download individual photos or entire gallery</p>
        </div>
      </div>

      <button
        onClick={() => setCurrentPage('camera')}
        className="bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 hover:from-pink-600 hover:via-purple-700 hover:to-cyan-600 text-white px-12 py-4 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl"
      >
        Start Photo Booth 🚀
      </button>
    </div>
  );

  const renderCameraPage = () => (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-black/20 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mb-6">
            {capturedPhoto ? (
              <img
                src={capturedPhoto}
                alt="Captured photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={getFilterStyle(selectedEffect)}
                />
                {isCapturing && (
                  <div className="absolute inset-0 bg-white animate-ping opacity-50 rounded-2xl" />
                )}
              </>
            )}
            
            {!cameraStarted && !capturedPhoto && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {error ? (
                    <div className="mb-4">
                      <p className="text-red-400 text-sm mb-4 max-w-sm">{error}</p>
                      <button
                        onClick={() => {
                          setError(null);
                          startCamera();
                        }}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold transition-all duration-200 transform hover:scale-105"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : loading ? (
                    <div className="text-white">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                      <p>Starting camera...</p>
                    </div>
                  ) : (
                    <button
                      onClick={startCamera}
                      disabled={loading}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                    >
                      Start Camera
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            {capturedPhoto ? (
              <>
                <button
                  onClick={() => downloadPhoto(capturedPhoto)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
                >
                  <Download size={20} />
                  Download
                </button>
                <button
                  onClick={retakePhoto}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
                >
                  <RotateCcw size={20} />
                  Retake
                </button>
              </>
            ) : cameraStarted ? (
              <>
                <button
                  onClick={capturePhoto}
                  disabled={isCapturing}
                  className={`bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none ${
                    isCapturing ? 'animate-pulse' : ''
                  }`}
                >
                  <Camera size={24} className="inline mr-2" />
                  {isCapturing ? 'Capturing...' : 'Capture Photo'}
                </button>
                <button
                  onClick={switchCamera}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-full transition-all duration-200 transform hover:scale-105"
                >
                  <RotateCcw size={20} />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <div className="bg-black/20 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Effects</h3>
          <div className="grid grid-cols-2 gap-3">
            {effects.map((effect) => {
              const Icon = effect.icon;
              const isSelected = selectedEffect === effect.id;
              
              return (
                <button
                  key={effect.id}
                  onClick={() => setSelectedEffect(effect.id)}
                  className={`p-3 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
                    isSelected
                      ? 'border-pink-500 bg-pink-500/20 text-pink-400'
                      : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Icon size={20} />
                    <span className="text-xs font-medium">{effect.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 text-center">Quick Frames</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedFrame('none')}
              className={`p-3 rounded-xl border transition-all ${
                selectedFrame === 'none'
                  ? 'border-purple-500 bg-purple-500/20 text-purple-400'
                  : 'border-white/20 bg-white/5 text-gray-300'
              }`}
            >
              None
            </button>
            <button
              onClick={() => setSelectedFrame('birthday1')}
              className={`p-3 rounded-xl border transition-all ${
                selectedFrame === 'birthday1'
                  ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                  : 'border-white/20 bg-white/5 text-gray-300'
              }`}
            >
              Birthday
            </button>
            <button
              onClick={() => setSelectedFrame('wedding1')}
              className={`p-3 rounded-xl border transition-all ${
                selectedFrame === 'wedding1'
                  ? 'border-yellow-600 bg-yellow-600/20 text-yellow-400'
                  : 'border-white/20 bg-white/5 text-gray-300'
              }`}
            >
              Wedding
            </button>
            <button
              onClick={() => setSelectedFrame('fun1')}
              className={`p-3 rounded-xl border transition-all ${
                selectedFrame === 'fun1'
                  ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400'
                  : 'border-white/20 bg-white/5 text-gray-300'
              }`}
            >
              Neon
            </button>
          </div>
          <button
            onClick={() => setCurrentPage('frames')}
            className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            More Frames →
          </button>
        </div>
      </div>
    </div>
  );

  const renderFramesPage = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Choose Your Frame</h2>
        <p className="text-gray-300">Select from our collection of beautiful frames</p>
      </div>

      {Object.entries(frames).map(([category, frameList]) => (
        <div key={category} className="bg-black/20 backdrop-blur-lg rounded-3xl p-6 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6 capitalize flex items-center gap-2">
            {category === 'birthday' && <Gift className="text-yellow-400" />}
            {category === 'wedding' && <Crown className="text-yellow-400" />}
            {category === 'nature' && <Sparkles className="text-green-400" />}
            {category === 'fun' && <Zap className="text-cyan-400" />}
            {category} Frames
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {frameList.map((frame) => (
              <button
                key={frame.id}
                onClick={() => {
                  setSelectedFrame(frame.id);
                  setCurrentPage('camera');
                }}
                className={`aspect-square rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 p-4 relative overflow-hidden ${
                  selectedFrame === frame.id
                    ? 'border-pink-500 bg-pink-500/20'
                    : 'border-white/20 bg-white/5 hover:border-white/40'
                }`}
              >
                <div className={`w-full h-full bg-gradient-to-br ${frame.color} rounded-lg flex items-center justify-center relative overflow-hidden`}>
                  <div className="text-white text-sm font-medium text-center z-10">
                    {frame.name}
                  </div>
                  
                  {/* Frame preview patterns */}
                  <div className="absolute inset-0">
                    {frame.id.includes('birthday') && (
                      <div className="absolute inset-2 border-4 border-yellow-400 rounded">
                        <div className="absolute top-1 left-1 text-yellow-400">⭐</div>
                        <div className="absolute top-1 right-1 text-yellow-400">🎉</div>
                        <div className="absolute bottom-1 left-1 text-yellow-400">🎂</div>
                        <div className="absolute bottom-1 right-1 text-yellow-400">🎈</div>
                      </div>
                    )}
                    
                    {frame.id.includes('wedding') && (
                      <div className="absolute inset-2 border-4 border-yellow-200 rounded">
                        <div className="absolute top-1 left-1 text-yellow-200">💍</div>
                        <div className="absolute top-1 right-1 text-yellow-200">👑</div>
                        <div className="absolute bottom-1 left-1 text-yellow-200">🌹</div>
                        <div className="absolute bottom-1 right-1 text-yellow-200">✨</div>
                      </div>
                    )}
                    
                    {frame.id.includes('nature') && (
                      <div className="absolute inset-2 border-4 border-green-400 rounded">
                        <div className="absolute top-1 left-1 text-green-400">🌸</div>
                        <div className="absolute top-1 right-1 text-green-400">🌿</div>
                        <div className="absolute bottom-1 left-1 text-green-400">🌺</div>
                        <div className="absolute bottom-1 right-1 text-green-400">🍀</div>
                      </div>
                    )}
                    
                    {frame.id.includes('fun') && (
                      <div className="absolute inset-2 border-4 border-cyan-400 rounded">
                        <div className="absolute top-1 left-1 text-cyan-400">🎵</div>
                        <div className="absolute top-1 right-1 text-cyan-400">✨</div>
                        <div className="absolute bottom-1 left-1 text-cyan-400">🕺</div>
                        <div className="absolute bottom-1 right-1 text-cyan-400">💫</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedFrame === frame.id && (
                  <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
      
      <div className="text-center">
        <button
          onClick={() => setCurrentPage('camera')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
        >
          Back to Camera
        </button>
      </div>
    </div>
  );

  const renderGalleryPage = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold text-white mb-2">Photo Gallery</h2>
          <p className="text-gray-300">{gallery.length} photos captured</p>
        </div>
        
        {gallery.length > 0 && (
          <button
            onClick={downloadAllPhotos}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Download size={20} />
            Download All ({gallery.length})
          </button>
        )}
      </div>

      {gallery.length === 0 ? (
        <div className="text-center py-16">
          <Camera size={64} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl text-gray-400 mb-2">No photos yet</h3>
          <p className="text-gray-500 mb-6">Start capturing memories!</p>
          <button
            onClick={() => setCurrentPage('camera')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:from-pink-600 hover:to-purple-700 transition-all"
          >
            Take First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((photo) => (
            <div key={photo.id} className="bg-black/20 backdrop-blur-lg rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all transform hover:scale-105">
              <img
                src={photo.data}
                alt="Gallery photo"
                className="w-full aspect-video object-cover rounded-xl mb-3"
              />
              <div className="text-sm text-gray-300 mb-2">
                <p>Effect: {effects.find(e => e.id === photo.effect)?.name || 'None'}</p>
                <p>Frame: {photo.frame !== 'none' ? photo.frame : 'None'}</p>
                <p>Taken: {photo.timestamp}</p>
              </div>
              <button
                onClick={() => downloadPhoto(photo.data, `photo-${photo.id}.png`)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-4 border border-white/10">
            <div className="flex justify-center space-x-2">
              {pages.map((page) => {
                const Icon = page.icon;
                const isActive = currentPage === page.id;
                
                return (
                  <button
                    key={page.id}
                    onClick={() => setCurrentPage(page.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="hidden sm:inline">{page.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main>
          {currentPage === 'home' && renderHomePage()}
          {currentPage === 'camera' && renderCameraPage()}
          {currentPage === 'frames' && renderFramesPage()}
          {currentPage === 'gallery' && renderGalleryPage()}
        </main>
      </div>

      {/* Hidden canvases */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <canvas ref={frameCanvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default PhotoBooth;