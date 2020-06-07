import React, { useCallback, useState } from 'react'

import './styles.css';

import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';

interface Props{
  onFileUploaded: (file: File) => void;
}

const MyDropzone: React.FC<Props> = ({ onFileUploaded }) => {
  const [fileUrl, setFileUrl] = useState('');
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];

    const fileUrl = URL.createObjectURL(file);

    setFileUrl(fileUrl);
    onFileUploaded(file);
  }, [onFileUploaded])
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: 'image/*' })

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} accept="image/*" />

      { fileUrl 
        ? <img src={fileUrl} alt="Point thumbnail" />
        : <p><FiUpload />Imagem do estabelecimento</p>
      }

    </div>
  )
}

export default MyDropzone;