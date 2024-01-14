import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import axios from 'axios';

import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Collapse from 'react-bootstrap/Collapse';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import BACKEND_URL from '../env';
import MainForm from '../components/MainForm';
import SaveEditorContentForm from '../components/SaveEditorContentForm';



function MainPage() {
  const navigate = useNavigate();
  const [runners, setRunners] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [saveMenuText, setSaveMenuText] = useState("Save Editor Content");
  const [expandSaveMenu, setExpandSaveMenu] = useState(false);
  const [content, setContent] = useState('');
  const editorRef = useRef(null);
  
  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/runners`, {withCredentials:true}).then(resp => {
      setRunners(resp.data.runners);
    }).catch(error => {
      setRunners(null);
      if (error.response.status === 401) {
        navigate(`/login?reason=401`)
      }
      console.log(`Failed to get runner options.\nException: ${error.response.data.message}`);
    });
  }, []);
  
  
  function getEditorContent() {
    setContent(editorRef.current.editorInst.getMarkdown());
    return editorRef.current.editorInst.getMarkdown();
  }
  
  function setEditorContent(param) {
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
    
    let file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      setEditorContent(e.target.result);
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
    setEditorContent("");
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
          contentSetter={setEditorContent}
          setErrorMsg={setErrorMsg}
          onFormSubmit={clearFileInput}
          navigate={navigate}
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
          
          <Col xs={2} className="px-0 mx-0">
            <Button
              variant="danger"
              type="button"
              key="editor-clear-input"
              id="editor-clear-input"
              onClick={onClearMarkdownInEditor}
            >
              Clear Editor
            </Button>
          </Col>
          
          <Col className="px-0 mx-0">
            <Button
              variant="success"
              type="button"
              key="editor-save-input"
              id="editor-save-input"
              onClick={_ => {
                setExpandSaveMenu(!expandSaveMenu);
                setSaveMenuText(expandSaveMenu ? "Save Editor Content" : "Hide Menu");
              }}
              aria-expanded={expandSaveMenu}
            >
              {saveMenuText}
            </Button>
          </Col>
          
        </Row>
      </Form>
      
      <Collapse in={expandSaveMenu}>
        <div className="py-0 my-0 px-0 mx-0">
          <SaveEditorContentForm
            contentGetter={getEditorContent}
            isServerReady={runners !== null}
            setErrorMsg={setErrorMsg}
          />
        </div>
      </Collapse>
      
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