import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { CameraIcon, UserCircleIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AvatarUploadProps {
  initialImage?: string | null;
  onChange?: (file: File | null) => void;
  onCapture?: (imageSrc: string, imageFile: File) => void;
  onCancel?: () => void;
  allowCamera?: boolean;
  className?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  initialImage = null, 
  onChange,
  onCapture,
  onCancel,
  allowCamera = false,
  className = 'w-20 h-20'
}) => {
  const [preview, setPreview] = useState<string | null>(initialImage);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  useEffect(() => {
    // Update preview if initialImage changes
    setPreview(initialImage);
  }, [initialImage]);

  useEffect(() => {
    // Clean up video stream when unmounting
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setIsCapturing(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Unable to access camera. Please make sure you've granted permission.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
    
    // Call onCancel if provided
    if (onCancel) {
      onCancel();
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to the canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL and file
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPreview(dataUrl);
        
        // Convert dataUrl to Blob/File
        const blob = dataToBlob(dataUrl);
        const file = new File([blob], "camera-capture.jpg", { type: 'image/jpeg' });
        
        // Call the change handler
        if (onCapture) {
          onCapture(dataUrl, file);
        } else if (onChange) {
          onChange(file);
        }
      }
      
      // Stop the camera stream
      stopCamera();
    }
  };

  // Convert data URL to Blob
  const dataToBlob = (dataUrl: string): Blob => {
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      if (onChange) {
        onChange(file);
      }
    }
  };
  
  const handleClick = () => {
    if (allowCamera && !preview) {
      // Show camera options
      const useCameraOrUpload = window.confirm("Would you like to use your camera to take a picture?\n\nClick 'OK' to use camera or 'Cancel' to upload a file instead.");
      if (useCameraOrUpload) {
        startCamera();
        return;
      }
    }
    
    if (!isCapturing) {
      fileInputRef.current?.click();
    }
  };
  
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onChange) {
      onChange(null);
    }
  };
  
  if (isCapturing) {
    return (
      <div className={`relative ${className} flex flex-col items-center justify-center overflow-hidden border-2 border-accent-300 dark:border-neutral-600 bg-black rounded-full`}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="absolute inset-0 min-w-full min-h-full object-cover"
        />
        
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 flex justify-center py-2 space-x-2">
          <button
            type="button"
            onClick={takePhoto}
            className="p-2 bg-primary-500 rounded-full text-white hover:bg-primary-600"
            title="Take Photo"
          >
            <CameraIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={stopCamera}
            className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
            title="Cancel"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Hidden canvas for capturing image */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }
  
  return (
    <div 
      className={`relative ${className} rounded-full overflow-hidden border-2 border-accent-300 dark:border-neutral-600 cursor-pointer group`}
      onClick={handleClick}
    >
      {preview ? (
        <>
          <img 
            src={preview} 
            alt="Avatar preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <CameraIcon className="h-8 w-8 text-white" />
          </div>
          <button
            type="button"
            className="absolute top-1 right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-accent-100 dark:bg-neutral-700">
          <div className="flex flex-col items-center">
            {allowCamera ? (
              <CameraIcon className="h-10 w-10 text-accent-400 dark:text-neutral-500" />
            ) : (
              <UserCircleIcon className="h-10 w-10 text-accent-400 dark:text-neutral-500" />
            )}
            <span className="text-xs text-accent-500 dark:text-neutral-400 mt-1">
              {allowCamera ? 'Photo' : 'Upload'}
            </span>
          </div>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;
