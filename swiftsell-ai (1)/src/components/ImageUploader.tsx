import React, { useState, useRef } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import Spinner from './Spinner';

interface ImageUploaderProps {
  onAnalyze: (images: File[]) => void;
  isAnalyzing: boolean;
}

// Helper to convert dataURL (base64) to a File object
const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
}


const CameraIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const UploadIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);


const ImageUploader: React.FC<ImageUploaderProps> = ({ onAnalyze, isAnalyzing }) => {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImageFiles = (newFiles: File[], newPreviews: string[]) => {
    if (newFiles.length > 0) {
      setImages(prev => [...prev, ...newFiles].slice(0, 3));
      setPreviews(prev => [...prev, ...newPreviews].slice(0, 3));
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    addImageFiles(newFiles, newPreviews);
  };
  
  const takePicture = async () => {
    if (images.length >= 3) return;
    try {
        const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: true,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Camera,
        });

        if (image.dataUrl) {
            const fileName = `photo_${new Date().getTime()}.jpeg`;
            const file = await dataUrlToFile(image.dataUrl, fileName);
            addImageFiles([file], [image.dataUrl]);
        }
    } catch (error) {
        // Gracefully handle user cancellation
        if (String(error).includes('User cancelled photos')) {
            return;
        }
        console.error("Camera failed:", error);
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const newPreviews = prev.filter((_, i) => i !== index);
      // Only revoke if it's an object URL, not a data URL from camera
      if(previews[index].startsWith('blob:')){
          URL.revokeObjectURL(previews[index]);
      }
      return newPreviews;
    });
  };

  const handleAnalyzeClick = () => {
    if (images.length > 0) {
      onAnalyze(images);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">Upload Your Item's Photos</h2>
        <p className="text-sm text-gray-400">Add up to 3 clear images for the best results.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button onClick={takePicture} className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg border-2 border-dashed border-gray-500 hover:bg-gray-600 hover:border-red-500 transition-colors">
          <CameraIcon className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-white font-semibold">Take Photo</span>
        </button>
        <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-6 bg-gray-700 rounded-lg border-2 border-dashed border-gray-500 hover:bg-gray-600 hover:border-red-500 transition-colors">
          <UploadIcon className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-white font-semibold">Upload Files</span>
        </button>
        <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files)} accept="image/*" multiple className="hidden" />
      </div>

      {previews.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-center">Image Previews</h3>
          <div className="grid grid-cols-3 gap-4">
            {previews.map((src, index) => (
              <div key={index} className="relative group">
                <img src={src} alt={`preview ${index}`} className="w-full h-24 object-cover rounded-md" />
                <button onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 leading-none group-hover:opacity-100 opacity-0 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleAnalyzeClick}
        disabled={images.length === 0 || isAnalyzing}
        className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {isAnalyzing ? (
          <>
            <Spinner size="h-6 w-6" />
            <span className="ml-3">Analyzing...</span>
          </>
        ) : (
          `Analyze ${images.length} Image${images.length !== 1 ? 's' : ''}`
        )}
      </button>
    </div>
  );
};

export default ImageUploader;