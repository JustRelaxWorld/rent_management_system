import React, { useState, useRef } from 'react';
import { Container, Form, Button, Row, Col, Alert, Card, Image } from 'react-bootstrap';
import api from '../../utils/api';

interface PropertyImageUploadProps {
  propertyId: string;
  onComplete?: () => void;
}

interface UploadedImage {
  id: string;
  filename: string;
  url: string;
}

const PropertyImageUpload: React.FC<PropertyImageUploadProps> = ({ propertyId, onComplete }) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing images when component mounts
  React.useEffect(() => {
    fetchImages();
  }, [propertyId]);

  const fetchImages = async () => {
    try {
      const response = await api.get(`/api/properties/${propertyId}/images`);
      setImages(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching images:', err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('propertyId', propertyId);
    
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const response = await api.post('/api/properties/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(`Successfully uploaded ${files.length} image(s)`);
      fetchImages(); // Refresh the images list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload images');
      console.error('Error uploading images:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await api.delete(`/api/properties/images/${imageId}`);
      setSuccess('Image deleted successfully');
      fetchImages(); // Refresh the images list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete image');
      console.error('Error deleting image:', err);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Container>
      <h3>Property Images</h3>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      {/* Upload Area */}
      <Card 
        className={`mb-4 ${dragActive ? 'border-primary' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Card.Body className="text-center p-5">
          <div className="mb-3">
            <i className="fas fa-cloud-upload-alt fa-3x text-muted"></i>
          </div>
          <h5>Upload Property Images</h5>
          <p className="text-muted">
            Drag and drop images here, or click to select files
          </p>
          <Button 
            variant="outline-primary" 
            onClick={triggerFileInput}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Select Images'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </Card.Body>
      </Card>

      {/* Images Grid */}
      {images.length > 0 && (
        <div>
          <h5>Uploaded Images</h5>
          <Row>
            {images.map((image) => (
              <Col key={image.id} xs={12} sm={6} md={4} lg={3} className="mb-3">
                <Card>
                  <Card.Img 
                    variant="top" 
                    src={image.url} 
                    alt={image.filename}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      Delete
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  );
};

export default PropertyImageUpload; 