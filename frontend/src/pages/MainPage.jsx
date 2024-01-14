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

import env from '../env';
import MainForm from '../components/MainForm';
import SaveEditorContentForm from '../components/SaveEditorContentForm';



function MainPage() {
  const navigate = useNavigate();
  const [runners, setRunners] = useState(null);
  const [isServerReady, setIsServerReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [saveMenuText, setSaveMenuText] = useState("Save Editor Content");
  const [expandSaveMenu, setExpandSaveMenu] = useState(false);
  const [content, setContent] = useState('');
  const editorRef = useRef(null);
  
  useEffect(() => {
    axios.get(`${env.BACKEND_URL}/api/runners`, {withCredentials:true}).then(resp => {
      setRunners(resp.data.runners);
      setIsServerReady(true);
    }).catch(error => {
      setRunners(null);
      setIsServerReady(false);
      let msg = 'Cannot reach server';
      if (error.response && error.response.status === 401) {
        msg = error.response.data.message;
        navigate(`/login?reason=401`)
      }
      console.log(`Failed to get runner options.\nException: ${msg}`);
      setErrorMsg(msg);
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
  
  function disableActionBtn() {
    document.querySelectorAll('.action-btn').forEach(a => {a.disabled = true;});
  }
  
  function enableActionBtn() {
    document.querySelectorAll('.action-btn').forEach(a => {a.disabled = false;});
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
    
    disableActionBtn();
    setEditorContent("");
    clearFileInput();
    enableActionBtn();
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
          isServerReady={isServerReady}
        />
      </Row>
      
      <Form
        key="editor-load-file-form"
        id="editor-load-file-form"
      >
        <Row className="my-3" style={{display:"flex", alignItems: "center"}}>
          
          <Col
            lg={3} md={6} sm={12} xs={12}
            className="pb-1"
          >
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
          
          <Col
            lg={2} md={3} sm={6} xs={6}
          >
            <Button
              variant="danger"
              type="button"
              key="editor-clear-input"
              id="editor-clear-input"
              className="action-btn"
              onClick={onClearMarkdownInEditor}
            >
              Clear Editor
            </Button>
          </Col>
          
          <Col
            lg={2} md={3} sm={6} xs={6}
            className="px-0 mx-0"
          >
            <Button
              variant="success"
              type="button"
              key="editor-save-input"
              id="editor-save-input"
              className="action-btn"
              onClick={_ => {
                disableActionBtn();
                setExpandSaveMenu(!expandSaveMenu);
                setSaveMenuText(expandSaveMenu ? "Save Editor Content" : "Hide Menu");
                enableActionBtn();
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
            isServerReady={isServerReady}
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