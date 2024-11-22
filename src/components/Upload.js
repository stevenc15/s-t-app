// src/components/Upload.js
import React from 'react'; // Import React to define the component
import { useDropzone } from 'react-dropzone'; // Import useDropzone from react-dropzone to handle drag-and-drop functionality

// Upload component that accepts an onDrop prop (the function to handle the file drop event)
const Upload = ({ onDrop }) => {
  // useDropzone hook initializes drag-and-drop area properties
  // getRootProps: used to bind the root div to the dropzone
  // getInputProps: used to bind the input element that handles file selection
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className="upload-area"> {/* Bind the dropzone functionality to the div */}
      <input {...getInputProps()} /> {/* Hidden input element to handle file selection */}
      <p className='upload-title'>Drag & drop your .mp4 file here, or click to select a file</p> {/* Display message to the user */}
    </div>
  );
};

export default Upload; // Export the Upload component so it can be imported and used in other parts of the app
