import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Image, Video, FileImage, Trash2 } from 'lucide-react';
import { uploadImage, uploadVideo } from '@/lib/cloudinaryConfig';

interface CloudinaryUploadProps {
  onUpload: (url: string, publicId: string) => void;
  onRemove?: (publicId: string) => void;
  accept?: 'image' | 'video' | 'both';
  folder?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  currentFiles?: Array<{ url: string; publicId: string; type: 'image' | 'video' }>;
  className?: string;
}

export default function CloudinaryUpload({
  onUpload,
  onRemove,
  accept = 'image',
  folder = 'ntb-web',
  maxSize = 10,
  multiple = false,
  currentFiles = [],
  className = ''
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Validate files
    for (const file of fileArray) {
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
        return;
      }

      if (accept === 'image' && !file.type.startsWith('image/')) {
        setError(`File ${file.name} is not an image.`);
        return;
      }

      if (accept === 'video' && !file.type.startsWith('video/')) {
        setError(`File ${file.name} is not a video.`);
        return;
      }
    }

    setError('');
    setUploading(true);
    setProgress(0);

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const uploadFolder = accept === 'video' ? `${folder}/videos` : folder;
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 10, 90));
        }, 100);

        let result;
        if (file.type.startsWith('video/')) {
          result = await uploadVideo(file, uploadFolder);
        } else {
          result = await uploadImage(file, uploadFolder);
        }

        clearInterval(progressInterval);
        setProgress(100);

        onUpload(result.secure_url, result.public_id);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = (publicId: string) => {
    if (onRemove) {
      onRemove(publicId);
    }
  };

  const getAcceptTypes = () => {
    switch (accept) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'both':
        return 'image/*,video/*';
      default:
        return 'image/*';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          dragOver ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload {accept === 'both' ? 'Images or Videos' : accept === 'image' ? 'Images' : 'Videos'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Drag and drop files here, or click to select files
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Maximum file size: {maxSize}MB
            </p>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mb-4"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
            
            <Input
              ref={fileInputRef}
              type="file"
              accept={getAcceptTypes()}
              multiple={multiple}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Files */}
      {currentFiles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Files:</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentFiles.map((file, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-4">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Video</p>
                      </div>
                    )}
                  </div>
                  
                  {onRemove && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove(file.publicId)}
                      className="absolute top-2 right-2 w-6 h-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                  
                  <div className="flex items-center text-xs text-gray-500">
                    {file.type === 'image' ? (
                      <Image className="w-3 h-3 mr-1" />
                    ) : (
                      <Video className="w-3 h-3 mr-1" />
                    )}
                    {file.type}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
