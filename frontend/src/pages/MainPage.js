import { useEffect, useState, useRef } from 'react';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import axios from 'axios';
import MainForm from '../components/MainForm';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';



function MainPage() {
  const [runners, setRunners] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [content, setContent] = useState('');
  const backend_url = 'http://localhost:3000';
  const editorRef = useRef(null);
  
  useEffect(() => {
    axios.get(`${backend_url}/api/runners`).then(resp => {
      setRunners(resp.data.runners);
    }).catch(error => {
      setRunners(null);
      console.log(`Failed to get runner options.\nException: ${error}`);
    });
  }, []);
  
  
  function editorContentSetter(param) {
    setContent(param);
    
    editorRef.current.editorInst.setMarkdown(param);
    
    // scroll the editor to top after 1ms
    setTimeout(_ => {
      editorRef.current.editorInst.setScrollTop(0);
    }, 1)
  }
  
  function onLoadMarkdownFromFile(event) {
    event.preventDefault();
    document.querySelector('#editor-load-file-input').disabled = true;
    
    console.log('hello');
    let file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      editorContentSetter(e.target.result);
      document.querySelector('#editor-load-file-input').disabled = false;
    }
    reader.readAsText(file)
  }
  
  function clearFileInput() {
    document.querySelector('#editor-load-file-input').value = "";
  }
  
  function onClearMarkdownInEditor(event) {
    event.preventDefault();
    
    document.querySelector('#editor-clear-input').disabled = true;
    editorContentSetter("");
    clearFileInput();
    document.querySelector('#editor-clear-input').disabled = false;
  }
  
  return (
    <Container>
      
      <Row>
        <div id="error-prompt" style={{color:"red", fontSize:"x-large", fontWeight:"bold"}}>
          {errorMsg ? errorMsg : ""}
        </div>
      </Row>
      
      <Row className="my-3">
        <MainForm
          runners={runners ? runners : null}
          backend_url={backend_url}
          contentSetter={editorContentSetter}
          setErrorMsg={setErrorMsg}
          onFormSubmit={clearFileInput}
        />
      </Row>
      
      <Form
        key="editor-load-file-form"
        id="editor-load-file-form"
      >
        <Row className="my-3" style={{display:"flex", alignItems: "center"}}>
          <Col xs={3}>
            <Form.Group>
              <Form.Label>
                Load A File From Disk
              </Form.Label>
              <Form.Control
                type="file"
                key="editor-load-file-input"
                id="editor-load-file-input"
                label="Load A File From Disk"
                alt="Load A File From Disk"
                onChange={onLoadMarkdownFromFile}
              />
            </Form.Group>
          </Col>
          <Col>
            <Button
              variant="primary"
              type="button"
              key="editor-clear-input"
              id="editor-clear-input"
              onClick={onClearMarkdownInEditor}
            >
              Clear Editor
            </Button>
          </Col>
        </Row>
      </Form>
      
      <Row className="my-3">
        <Editor
          previewStyle="vertical"
          initialEditType="markdown"
          initialValue=""
          height="500px"
          ref={editorRef}
        />
      </Row>
      
    </Container>
  );
}

export default MainPage;