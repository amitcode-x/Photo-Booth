// Enhanced Download Button with Save Option
const DownloadButton = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedPhotos, setSavedPhotos] = useState([]);
  const { capturedImage, selectedFilter, stickers, loveNote } = usePhotoBooth();

  const generatePolaroidDataURL = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const polaroidWidth = 400;
    const polaroidHeight = 500;
    const imageSize = 360;
    const borderSize = 20;
    
    canvas.width = polaroidWidth;
    canvas.height = polaroidHeight;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, polaroidWidth, polaroidHeight);
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.filter = filters.find(f => f.id === selectedFilter)?.filter || 'none';
        ctx.drawImage(img, borderSize, borderSize, imageSize, imageSize);
        ctx.filter = 'none';
        
        stickers.forEach((sticker) => {
          const x = (sticker.x / 100) * imageSize + borderSize;
          const y = (sticker.y / 100) * imageSize + borderSize;
          
          if (sticker.type === 'marker') {
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(x - 25, y - 8, 50, 16);
            ctx.strokeStyle = '#facc15';
            ctx.strokeRect(x - 25, y - 8, 50, 16);
            ctx.fillStyle = '#374151';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(sticker.timestamp, x, y + 3);
          } else {
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(sticker.emoji, x, y);
          }
        });
        
        const captionY = imageSize + borderSize + 20;
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        ctx.fillText(`${currentDate} • ${currentTime}`, polaroidWidth / 2, captionY);
        
        if (loveNote) {
          ctx.fillStyle = '#374151';
          ctx.font = '16px cursive';
          ctx.fillText(loveNote, polaroidWidth / 2, captionY + 30);
        } else {
          ctx.fillText('Made with love 💕', polaroidWidth / 2, captionY + 30);
        }
        
        resolve(canvas.toDataURL());
      };
      img.src = capturedImage;
    });
  };

  const savePhoto = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    const dataURL = await generatePolaroidDataURL();
    
    const savedPhoto = {
      id: Date.now(),
      dataURL,
      filter: selectedFilter,
      note: loveNote,
      date: new Date().toLocaleString(),
      stickers: stickers.length
    };
    
    setSavedPhotos(prev => [...prev, savedPhoto]);
    setShowSaveModal(false);
    setIsProcessing(false);
    
    // Show success animation
    const successDiv = document.createElement('div');
    successDiv.innerHTML = '💾 Photo Saved Successfully! ✨';
    successDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(45deg, #10b981, #059669);
      color: white;
      padding: 20px 30px;
      border-radius: 15px;
      font-size: 18px;
      font-weight: bold;
      z-index: 9999;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      animation: saveSuccess 2s ease-in-out forwards;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes saveSuccess {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      document.body.removeChild(successDiv);
      document.head.removeChild(style);
    }, 2000);
  };

  const downloadPhoto = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    const dataURL = await generatePolaroidDataURL();
    
    const link = document.createElement('a');
    link.download = `love-booth-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
    
    setShowSaveModal(false);
    setIsProcessing(false);
  };

  return (
    <>
      <motion.button
        onClick={() => setShowPreview(true)}
        disabled={!capturedImage || isProcessing}
        className="bg-gradient-to-r from-pink-500 to-rose-500 text-white p-3 rounded-full shadow-lg disabled:opacity-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isProcessing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles size={20} />
          </motion.div>
        ) : (
          <Heart size={20} />
        )}
      </motion.button>

      <AnimatePresence>
        {showPreview && (
          <PolaroidPreview
            imageData={capturedImage}
            filter={selectedFilter}
            stickers={stickers}
            loveNote={loveNote}
            onClose={() => setShowPreview(false)}
          />
        )}
      </AnimatePresence>

      {showPreview && (
        <motion.button
          onClick={() => setShowSaveModal(true)}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-4 rounded-full shadow-xl z-50 flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
        >
          <Heart size={20} />
          <span className="font-medium">Save Memory</span>
        </motion.button>
      )}

      <SaveConfirmationModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={savePhoto}
        onDownload={downloadPhoto}
      />
    </>
  );
};import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, RotateCcw, Heart, Download, Upload, X, Sparkles, Play, MessageCircle } from 'lucide-react';

// Photo Booth Context
const PhotoBoothContext = createContext();

const usePhotoBooth = () => {
  const context = useContext(PhotoBoothContext);
  if (!context) {
    throw new Error('usePhotoBooth must be used within PhotoBoothProvider');
  }
  return context;
};

// Photo Booth Provider
const PhotoBoothProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('landing'); // landing, camera, editor
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [stickers, setStickers] = useState([]);
  const [loveNote, setLoveNote] = useState('');
  const [isFlashActive, setIsFlashActive] = useState(false);

  const value = {
    currentView, setCurrentView,
    capturedImage, setCapturedImage,
    selectedFilter, setSelectedFilter,
    stickers, setStickers,
    loveNote, setLoveNote,
    isFlashActive, setIsFlashActive
  };

  return (
    <PhotoBoothContext.Provider value={value}>
      {children}
    </PhotoBoothContext.Provider>
  );
};

// Filter definitions with occasions
const filters = [
  { id: 'none', name: 'Original', filter: 'none', emoji: '📷' },
  { id: 'romantic', name: 'Romantic', filter: 'sepia(0.3) contrast(1.1) brightness(1.1)', emoji: '💕' },
  { id: 'dreamy', name: 'Dreamy', filter: 'blur(0.5px) brightness(1.2) contrast(0.9)', emoji: '✨' },
  { id: 'vintage', name: 'Vintage', filter: 'sepia(0.5) contrast(1.2) brightness(0.9)', emoji: '📸' },
  { id: 'warm', name: 'Warm', filter: 'hue-rotate(20deg) saturate(1.2) brightness(1.1)', emoji: '🌅' },
  { id: 'soft', name: 'Soft', filter: 'contrast(0.8) brightness(1.1) saturate(0.9)', emoji: '🌸' },
  { id: 'birthday', name: 'Birthday', filter: 'hue-rotate(45deg) saturate(1.5) brightness(1.2)', emoji: '🎂' },
  { id: 'party', name: 'Party', filter: 'contrast(1.3) saturate(1.4) brightness(1.1)', emoji: '🎉' },
  { id: 'wedding', name: 'Wedding', filter: 'sepia(0.2) contrast(1.1) brightness(1.3)', emoji: '💒' },
  { id: 'anniversary', name: 'Anniversary', filter: 'hue-rotate(320deg) saturate(1.2) brightness(1.1)', emoji: '💖' },
  { id: 'friendship', name: 'Friendship', filter: 'hue-rotate(60deg) saturate(1.1) brightness(1.2)', emoji: '👯' },
  { id: 'graduation', name: 'Graduation', filter: 'contrast(1.2) saturate(1.1) brightness(1.1)', emoji: '🎓' }
];

// Enhanced Frame System with automatic application
const frameStyles = {
  none: {
    border: 'none',
    borderRadius: '0px',
    background: 'transparent',
    boxShadow: 'none'
  },
  birthday: {
    border: '8px solid transparent',
    borderRadius: '15px',
    background: `
      linear-gradient(white, white) padding-box,
      linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4ecdc4, #45b7d1) border-box
    `,
    boxShadow: '0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 30px rgba(255, 215, 0, 0.1)'
  },
  party: {
    border: '6px solid transparent',
    borderRadius: '10px',
    background: `
      linear-gradient(white, white) padding-box,
      linear-gradient(45deg, #ff0080, #ff8c00, #ffd700, #ff0080) border-box
    `,
    boxShadow: '0 0 25px rgba(255, 0, 128, 0.4)'
  },
  wedding: {
    border: '10px solid #ffffff',
    borderRadius: '20px',
    background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.2), rgba(248, 250, 252, 0.1))',
    boxShadow: '0 0 40px rgba(255, 255, 255, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)'
  },
  anniversary: {
    border: '8px solid transparent',
    borderRadius: '25px',
    background: `
      linear-gradient(white, white) padding-box,
      linear-gradient(45deg, #ff69b4, #ff1493, #dc143c, #ff69b4) border-box
    `,
    boxShadow: '0 0 35px rgba(255, 105, 180, 0.5)'
  },
  friendship: {
    border: '6px solid transparent',
    borderRadius: '12px',
    background: `
      linear-gradient(white, white) padding-box,
      linear-gradient(45deg, #32cd32, #00fa9a, #7fffd4, #32cd32) border-box
    `,
    boxShadow: '0 0 25px rgba(50, 205, 50, 0.4)'
  },
  graduation: {
    border: '8px solid transparent',
    borderRadius: '15px',
    background: `
      linear-gradient(white, white) padding-box,
      linear-gradient(45deg, #4169e1, #1e90ff, #00bfff, #4169e1) border-box
    `,
    boxShadow: '0 0 30px rgba(65, 105, 225, 0.4)'
  },
  romantic: {
    border: '6px solid transparent',
    borderRadius: '20px',
    background: `
      linear-gradient(white, white) padding-box,
      linear-gradient(45deg, #ff69b4, #ff1493, #ff69b4) border-box
    `,
    boxShadow: '0 0 25px rgba(255, 105, 180, 0.3)'
  }
};
const stickerPacks = [
  { id: 1, emoji: '💖', type: 'heart' },
  { id: 2, emoji: '🌹', type: 'rose' },
  { id: 3, emoji: '💕', type: 'hearts' },
  { id: 4, emoji: '✨', type: 'sparkles' },
  { id: 5, emoji: '💋', type: 'kiss' },
  { id: 6, emoji: '🥰', type: 'love' },
  { id: 7, emoji: '🦋', type: 'butterfly' },
  { id: 8, emoji: '🌸', type: 'flower' }
];

// Landing Screen Component
const LandingScreen = () => {
  const { setCurrentView, setCapturedImage } = usePhotoBooth();
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    // Generate floating hearts
    const heartArray = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 30 + 20,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 4
    }));
    setHearts(heartArray);
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        setCurrentView('editor');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      className="relative min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-rose-400 overflow-hidden flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            className="absolute text-pink-200/30"
            style={{
              left: `${heart.left}%`,
              fontSize: `${heart.size}px`,
            }}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ 
              y: '-100vh', 
              opacity: [0, 1, 1, 0],
              rotate: 360 
            }}
            transition={{
              duration: heart.duration,
              delay: heart.delay,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            💖
          </motion.div>
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="text-6xl text-pink-200/50"
        >
          ✨
        </motion.div>
      </div>
      
      <div className="absolute top-20 right-16">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="text-4xl text-purple-200/50"
        >
          🌸
        </motion.div>
      </div>

      <div className="absolute bottom-20 left-20">
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="text-5xl text-rose-200/50"
        >
          🦋
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-lg">
        {/* Logo/Title */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="relative mb-8">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1] 
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-8xl mb-4"
            >
              💕
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-pink-100 to-rose-100 bg-clip-text text-transparent mb-2" 
                style={{ fontFamily: 'cursive' }}>
              Love Booth
            </h1>
            <motion.p 
              className="text-lg text-pink-100/80 font-medium"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Create magical moments together ✨
            </motion.p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="space-y-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          {/* Start Camera Button */}
          <motion.button
            onClick={() => setCurrentView('camera')}
            className="group relative w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-6 rounded-2xl shadow-2xl font-semibold text-lg overflow-hidden"
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 25px 50px -12px rgba(236, 72, 153, 0.5)" 
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400 opacity-0 group-hover:opacity-100"
              initial={false}
              transition={{ duration: 0.3 }}
            />
            <div className="relative flex items-center justify-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Camera size={28} />
              </motion.div>
              <span>Start Photo Session</span>
            </div>
            
            {/* Sparkle Effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              initial={false}
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-200"
                  style={{
                    left: `${20 + i * 12}%`,
                    top: `${30 + (i % 2) * 40}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    repeat: Infinity
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </motion.div>
          </motion.button>

          {/* Upload Button */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="landing-file-upload"
            />
            <label htmlFor="landing-file-upload">
              <motion.div
                className="cursor-pointer w-full bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-medium text-lg hover:bg-white/30 transition-all duration-300"
                whileHover={{ 
                  scale: 1.02,
                  borderColor: "rgba(255, 255, 255, 0.5)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center space-x-3">
                  <Upload size={24} />
                  <span>Upload Your Photo</span>
                </div>
              </motion.div>
            </label>
          </div>
        </motion.div>

        {/* Feature Pills */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          {['Romantic Filters', 'Love Stickers', 'Polaroid Style'].map((feature, index) => (
            <motion.div
              key={feature}
              className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white/80 border border-white/20"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.7 + index * 0.1 }}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            >
              {feature}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Decoration */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/10 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 2 }}
      />
    </motion.div>
  );
};

// Enhanced Camera Screen with Attractive Design
const CameraFullScreen = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [sparkles, setSparkles] = useState([]);
  
  const { 
    setCapturedImage, 
    setCurrentView, 
    selectedFilter,
    isFlashActive,
    setIsFlashActive 
  } = usePhotoBooth();

  // Generate floating sparkles
  useEffect(() => {
    const sparkleArray = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 20 + 10,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 2
    }));
    setSparkles(sparkleArray);
  }, []);

  useEffect(() => {
    if (cameraStarted) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, cameraStarted]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: { 
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    setIsFlashActive(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.filter = filters.find(f => f.id === selectedFilter)?.filter || 'none';
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);

    setTimeout(() => {
      setIsFlashActive(false);
      setIsCapturing(false);
      setCurrentView('editor');
    }, 300);
  };

  const flipCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        setCurrentView('editor');
      };
      reader.readAsDataURL(file);
    }
  };

  if (!cameraStarted) {
    return (
      <motion.div 
        className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-pink-400 via-purple-400 to-rose-500 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute text-white/20"
              style={{
                left: `${sparkle.left}%`,
                fontSize: `${sparkle.size}px`,
              }}
              initial={{ y: '100vh', opacity: 0, rotate: 0 }}
              animate={{ 
                y: '-100vh', 
                opacity: [0, 1, 1, 0],
                rotate: 360 
              }}
              transition={{
                duration: sparkle.duration,
                delay: sparkle.delay,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              ✨
            </motion.div>
          ))}
        </div>

        {/* Floating Hearts */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-pink-200/30 text-4xl"
              style={{
                left: `${20 + i * 10}%`,
                top: `${20 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3 + i * 0.2,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              💖
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 text-center">
          <motion.div
            className="mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 10, delay: 0.2 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1] 
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-4"
            >
              📸
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'cursive' }}>
              Ready for Magic?
            </h2>
            <p className="text-white/80">Let's capture your beautiful moments</p>
          </motion.div>

          <motion.button
            onClick={() => setCameraStarted(true)}
            className="group bg-gradient-to-r from-white to-pink-50 text-gray-800 px-10 py-5 rounded-full text-xl font-semibold shadow-2xl flex items-center space-x-4 mx-auto overflow-hidden relative"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 15, delay: 0.5 }}
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-100 to-rose-100 opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />
            
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative z-10"
            >
              <Play size={28} />
            </motion.div>
            <span className="relative z-10">Allow Camera Access</span>
            
            {/* Sparkle effect */}
            <motion.div className="absolute inset-0 opacity-0 group-hover:opacity-100">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-400"
                  style={{
                    left: `${25 + i * 15}%`,
                    top: `${30 + (i % 2) * 40}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180]
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.2,
                    repeat: Infinity
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </motion.div>
          </motion.button>
          
          <motion.button
            onClick={() => setCurrentView('landing')}
            className="mt-6 text-white/80 underline hover:text-white transition-colors text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
          >
            ← Back to Home
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-rose-600"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced Flash Overlay */}
      <AnimatePresence>
        {isFlashActive && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-200 via-white to-pink-200 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.95 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute text-white/10"
            style={{
              left: `${sparkle.left}%`,
              fontSize: `${sparkle.size}px`,
            }}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ 
              y: '-100vh', 
              opacity: [0, 0.5, 0.5, 0],
              rotate: [0, 360] 
            }}
            transition={{
              duration: sparkle.duration,
              delay: sparkle.delay,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>

      {/* Back Button */}
      <motion.button
        onClick={() => setCurrentView('landing')}
        className="absolute top-6 left-6 z-30 bg-white/30 backdrop-blur-sm p-4 rounded-full text-white shadow-xl border border-white/20"
        whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.4)" }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <X size={24} />
      </motion.button>

      {/* Enhanced Title */}
      <motion.div 
        className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30">
          <motion.h2 
            className="text-xl font-bold text-white flex items-center space-x-2"
            style={{ fontFamily: 'cursive' }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span>📸</span>
            <span>Love Camera</span>
            <span>✨</span>
          </motion.h2>
        </div>
      </motion.div>

      {/* Video Container */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <motion.div 
          className="relative w-full max-w-lg h-full max-h-screen"
          initial={{ scale: 0.8, rotateY: 180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Decorative Frame */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-rose-400 rounded-3xl p-1 shadow-2xl">
            <div className="w-full h-full bg-white rounded-3xl p-2">
              <motion.video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-2xl shadow-inner"
                style={{ 
                  filter: filters.find(f => f.id === selectedFilter)?.filter || 'none',
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              />
            </div>
          </div>
          
          {/* Filter Carousel Overlay */}
          <div className="absolute top-4 left-0 right-0">
            <FilterCarousel />
          </div>

          {/* Enhanced Camera Controls */}
          <motion.div 
            className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-8"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
          >
            {/* Upload Button */}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="camera-file-upload"
            />
            <label htmlFor="camera-file-upload">
              <motion.div
                className="bg-white/90 backdrop-blur-sm p-4 rounded-full text-gray-700 shadow-xl border-2 border-white cursor-pointer"
                whileHover={{ scale: 1.15, backgroundColor: "rgba(255, 255, 255, 1)" }}
                whileTap={{ scale: 0.9 }}
              >
                <Upload size={28} />
              </motion.div>
            </label>

            {/* Capture Button */}
            <motion.button
              onClick={capturePhoto}
              disabled={isCapturing}
              className="relative bg-gradient-to-r from-pink-500 to-rose-500 p-8 rounded-full text-white shadow-2xl disabled:opacity-50 border-4 border-white/50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={isCapturing ? { 
                rotate: 360,
                scale: [1, 1.2, 1] 
              } : { 
                rotate: 0,
                scale: [1, 1.05, 1] 
              }}
              transition={{ 
                rotate: { duration: 0.3 },
                scale: { duration: 2, repeat: Infinity }
              }}
            >
              <Camera size={40} />
              
              {/* Ripple Effect */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/30"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>

            {/* Flip Camera Button */}
            <motion.button
              onClick={flipCamera}
              className="bg-white/90 backdrop-blur-sm p-4 rounded-full text-gray-700 shadow-xl border-2 border-white"
              whileHover={{ scale: 1.15, backgroundColor: "rgba(255, 255, 255, 1)" }}
              whileTap={{ scale: 0.9 }}
            >
              <RotateCcw size={28} />
            </motion.button>
          </motion.div>

          {/* Capture Counter */}
          <AnimatePresence>
            {isCapturing && (
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                <div className="bg-white/90 rounded-full p-8 shadow-2xl">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.3, repeat: 1 }}
                    className="text-6xl"
                  >
                    📸
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
};

// Filter Carousel Component
const FilterCarousel = () => {
  const { selectedFilter, setSelectedFilter } = usePhotoBooth();

  return (
    <motion.div 
      className="flex space-x-2 px-4 overflow-x-auto scrollbar-hide"
      style={{ 
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {filters.map((filter, index) => (
        <motion.button
          key={filter.id}
          onClick={() => setSelectedFilter(filter.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
            selectedFilter === filter.id
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg scale-105'
              : 'bg-white/30 backdrop-blur-sm text-white hover:bg-white/40'
          }`}
          whileHover={{ scale: selectedFilter === filter.id ? 1.05 : 1.02 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + index * 0.05 }}
        >
          <span className="text-base">{filter.emoji}</span>
          <span>{filter.name}</span>
        </motion.button>
      ))}
    </motion.div>
  );
};

// Enhanced Love Note Input Component
const LoveNoteInput = () => {
  const { loveNote, setLoveNote } = usePhotoBooth();

  return (
    <motion.div 
      className="mt-6 w-full max-w-md"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="relative">
        <motion.div
          className="absolute -top-8 left-4 flex items-center space-x-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <MessageCircle size={16} className="text-pink-500" />
          </motion.div>
          <span className="text-sm font-medium text-gray-600">Add your love message</span>
        </motion.div>
        
        <motion.input
          type="text"
          placeholder="Write your love message... 💕"
          value={loveNote}
          onChange={(e) => setLoveNote(e.target.value)}
          className="w-full px-6 py-4 rounded-xl border-2 border-pink-200 focus:border-pink-400 outline-none bg-white/90 backdrop-blur-sm text-gray-700 placeholder-gray-500 shadow-lg transition-all duration-300"
          style={{ fontFamily: 'cursive' }}
          whileFocus={{ scale: 1.02 }}
        />
        
        <motion.div 
          className="absolute right-4 top-1/2 transform -translate-y-1/2"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0] 
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-pink-400 text-xl">💕</span>
        </motion.div>
        
        {/* Character counter */}
        <motion.div 
          className="absolute -bottom-6 right-2 text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: loveNote.length > 0 ? 1 : 0.5 }}
        >
          {loveNote.length}/100
        </motion.div>
      </div>
    </motion.div>
  );
};

// Canvas Editor Component
const CanvasEditor = () => {
  const canvasRef = useRef(null);
  const { 
    capturedImage, 
    selectedFilter, 
    stickers, 
    setStickers,
    loveNote,
    setCurrentView 
  } = usePhotoBooth();

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    const newMarker = {
      id: Date.now(),
      x,
      y,
      timestamp: new Date().toLocaleTimeString(),
      type: 'marker'
    };
    
    setStickers(prev => [...prev, newMarker]);
  };

  return (
    <motion.div 
      className="relative w-full h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-rose-100 overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Enhanced Header */}
      <motion.div 
        className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={() => setCurrentView('camera')}
          className="bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white/90 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={20} />
        </motion.button>
        
        <motion.h1 
          className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent"
          style={{ fontFamily: 'cursive' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Love Booth ✨
        </motion.h1>
        
        <DownloadButton />
      </motion.div>

      {/* Main Canvas Area */}
      <div className="flex flex-col items-center justify-center h-full pt-20 pb-4 px-4">
        <motion.div 
          className="relative max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", damping: 20 }}
        >
          <div 
            ref={canvasRef}
            className="relative w-full aspect-[3/4] cursor-crosshair overflow-hidden"
            onClick={handleCanvasClick}
          >
            {capturedImage && (
              <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
              style={{ 
                filter: filters.find(f => f.id === selectedFilter)?.filter || 'none',
                ...(frameStyles[selectedFilter] || {})
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            )}
            
            {/* Stickers and Markers */}
            <AnimatePresence>
              {stickers.map((sticker, index) => (
                <motion.div
                  key={sticker.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ 
                    left: `${sticker.x}%`, 
                    top: `${sticker.y}%`
                  }}
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  whileHover={{ scale: 1.3 }}
                  drag
                  dragMomentum={false}
                  onDoubleClick={() => setStickers(prev => prev.filter(s => s.id !== sticker.id))}
                  transition={{ delay: index * 0.1 }}
                >
                  {sticker.type === 'marker' ? (
                    <div className="bg-gradient-to-r from-yellow-300 to-yellow-400 px-2 py-1 rounded text-xs font-medium shadow-lg border-2 border-yellow-500">
                      {sticker.timestamp}
                    </div>
                  ) : (
                    <span className="text-2xl drop-shadow-lg">{sticker.emoji}</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Enhanced Sticker Panel */}
        <StickerPanel />
        
        {/* Enhanced Love Note Input - Fixed */}
        <LoveNoteInput />
      </div>
    </motion.div>
  );
};

// Enhanced Sticker Panel with Categories and Auto-Selection
const StickerPanel = () => {
  const { setStickers, selectedFilter } = usePhotoBooth();
  const [activeCategory, setActiveCategory] = useState('general');

  // Get stickers based on selected filter or active category
  const getRelevantStickers = () => {
    const filterCategories = {
      'birthday': 'birthday',
      'party': 'party', 
      'wedding': 'wedding',
      'anniversary': 'love',
      'romantic': 'love',
      'friendship': 'general',
      'graduation': 'graduation'
    };
    
    const category = filterCategories[selectedFilter] || activeCategory;
    let relevantStickers = stickerPacks.filter(sticker => 
      sticker.category === category
    );

    // If no specific stickers found, add some general ones
    if (relevantStickers.length < 4) {
      const generalStickers = stickerPacks.filter(s => s.category === 'general');
      relevantStickers = [...relevantStickers, ...generalStickers].slice(0, 8);
    }

    return relevantStickers;
  };

  const addSticker = (sticker) => {
    const newSticker = {
      ...sticker,
      id: Date.now() + Math.random(),
      x: 20 + Math.random() * 60, // Better positioning
      y: 20 + Math.random() * 60,
    };
    setStickers(prev => [...prev, newSticker]);
  };

  const categories = [
    { id: 'general', name: 'General', emoji: '✨' },
    { id: 'love', name: 'Love', emoji: '💕' },
    { id: 'birthday', name: 'Birthday', emoji: '🎂' },
    { id: 'party', name: 'Party', emoji: '🎉' },
    { id: 'wedding', name: 'Wedding', emoji: '💒' },
    { id: 'graduation', name: 'Graduation', emoji: '🎓' }
  ];

  const relevantStickers = getRelevantStickers();
  const isAutoCategory = ['birthday', 'party', 'wedding', 'anniversary', 'romantic', 'graduation'].includes(selectedFilter);

  return (
    <motion.div 
      className="mt-6 w-full max-w-md"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles size={16} className="text-pink-500" />
          </motion.div>
          <span className="text-sm font-medium text-gray-600">
            {isAutoCategory ? 
              `${filters.find(f => f.id === selectedFilter)?.name} Stickers` : 
              'Add Stickers'
            }
          </span>
        </div>
        
        {/* Category Selector - only show if not auto-selected by filter */}
        {!isAutoCategory && (
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="text-xs bg-white/80 border border-pink-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>
      
      <motion.div 
        className="grid grid-cols-4 gap-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg min-h-[120px]"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {relevantStickers.length > 0 ? (
            relevantStickers.map((sticker, index) => (
              <motion.button
                key={`${sticker.id}-${selectedFilter}-${activeCategory}`}
                onClick={() => addSticker(sticker)}
                className="text-3xl p-3 rounded-xl hover:bg-white/80 transition-all duration-300 transform hover:scale-110 flex items-center justify-center"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.8 }}
                initial={{ scale: 0, rotate: 180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: -180, opacity: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {sticker.emoji}
              </motion.button>
            ))
          ) : (
            <motion.div 
              className="col-span-4 flex items-center justify-center text-gray-500 text-sm py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No stickers available for this category
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Add Popular Stickers */}
      {relevantStickers.length > 0 && (
        <motion.div 
          className="mt-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span className="text-xs text-gray-500">Tap any sticker to add • Double-tap placed stickers to remove</span>
        </motion.div>
      )}
    </motion.div>
  );
};

// Save Confirmation Modal
const SaveConfirmationModal = ({ isOpen, onClose, onConfirm, onDownload }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <motion.div
            className="text-6xl mb-4"
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💾
          </motion.div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'cursive' }}>
            Save Your Memory
          </h3>
          <p className="text-gray-600 mb-6">
            Would you like to save this beautiful moment?
          </p>
          
          <div className="space-y-3">
            <motion.button
              onClick={onConfirm}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>💾</span>
              <span>Save Photo</span>
            </motion.button>
            
            <motion.button
              onClick={onDownload}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download size={18} />
              <span>Direct Download</span>
            </motion.button>
            
            <motion.button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
const PolaroidPreview = ({ imageData, filter, stickers, loveNote, onClose }) => {
  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      <motion.div
        className="relative bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full"
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <div className="relative w-full aspect-square overflow-hidden rounded-lg shadow-inner">
            <img
              src={imageData}
              alt="Polaroid"
              className="w-full h-full object-cover"
              style={{ filter: filters.find(f => f.id === filter)?.filter || 'none' }}
            />
            
            {stickers.map((sticker) => (
              <div
                key={sticker.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `${sticker.x}%`, 
                  top: `${sticker.y}%`
                }}
              >
                {sticker.type === 'marker' ? (
                  <div className="bg-yellow-300 px-2 py-1 rounded text-xs font-medium shadow border border-yellow-400">
                    {sticker.timestamp}
                  </div>
                ) : (
                  <span className="text-lg drop-shadow">{sticker.emoji}</span>
                )}
              </div>
            ))}
          </div>
          
          <div className="bg-white p-4 text-center">
            <div className="text-xs text-gray-500 mb-2 flex items-center justify-center space-x-2">
              <span>{currentDate}</span>
              <span>•</span>
              <span>{currentTime}</span>
            </div>
            <div 
              className="text-base text-gray-700 font-medium"
              style={{ fontFamily: 'cursive' }}
            >
              {loveNote || 'Made with love 💕'}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};



// Main App Component
const App = () => {
  const { currentView } = usePhotoBooth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-rose-200">
      <AnimatePresence mode="wait">
        {currentView === 'landing' && (
          <motion.div key="landing">
            <LandingScreen />
          </motion.div>
        )}
        {currentView === 'camera' && (
          <motion.div key="camera">
            <CameraFullScreen />
          </motion.div>
        )}
        {currentView === 'editor' && (
          <motion.div key="editor">
            <CanvasEditor />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Root Component with Provider
export default function PhotoBoothApp() {
  return (
    <PhotoBoothProvider>
      <App />
    </PhotoBoothProvider>
  );
}