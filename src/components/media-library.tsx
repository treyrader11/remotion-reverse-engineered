
import React, { useState, useRef } from 'react';

interface MediaItem {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  url: string;
  duration?: number;
  size: number;
}

interface MediaLibraryProps {
  onAddToTimeline: (mediaItem: MediaItem) => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ onAddToTimeline }) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList) => {
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      const mediaItem: MediaItem = {
        id: crypto.randomUUID(),
        name: file.name,
        type: getMediaType(file.type),
        url,
        size: file.size
      };

      // For video/audio, we could get duration here
      if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        const media = document.createElement(file.type.startsWith('video/') ? 'video' : 'audio');
        media.src = url;
        media.onloadedmetadata = () => {
          mediaItem.duration = media.duration;
          setMediaItems(prev => prev.map(item => 
            item.id === mediaItem.id ? { ...item, duration: media.duration } : item
          ));
        };
      }

      setMediaItems(prev => [...prev, mediaItem]);
    });
  };

  const getMediaType = (mimeType: string): 'video' | 'audio' | 'image' => {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'image';
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'audio':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="h-full bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">Media Library</h3>
        
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-600 hover:border-gray-500'
          }`}
        >
          <div className="text-gray-400 mb-2">
            <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-sm text-gray-400 mb-2">Drop files here or</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/*,audio/*,image/*"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {mediaItems.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No media files yet</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify(item));
                }}
                className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 cursor-move transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-400">
                    {getMediaIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                    <div className="text-xs text-gray-400 space-x-2">
                      <span>{item.type}</span>
                      <span>•</span>
                      <span>{formatFileSize(item.size)}</span>
                      {item.duration && (
                        <>
                          <span>•</span>
                          <span>{formatDuration(item.duration)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onAddToTimeline(item)}
                    className="text-gray-400 hover:text-white p-1"
                    title="Add to timeline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
