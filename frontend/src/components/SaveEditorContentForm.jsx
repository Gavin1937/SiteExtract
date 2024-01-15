import { useState } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';

import env from '../env';
import '../css/fadeout.css';


function SaveEditorContentForm(props) {
  
  const [saveFileModalState, setSaveFileModalState] = useState(false);
  const [outputFilename, setOutputFilename] = useState("output.md");
  
  function hideSaveFileModal() {
    setSaveFileModalState(false);
  }
  
  function showSaveFileModal() {
    setSaveFileModalState(true);
  }
  
  function disableActionBtn() {
    document.querySelectorAll('.action-btn').forEach(a => {a.disabled = true;});
  }
  
  function enableActionBtn() {
    document.querySelectorAll('.action-btn').forEach(a => {a.disabled = false;});
  }
  
  function onSaveToFile_SaveBtnClick(envent) {
    envent.preventDefault();
    hideSaveFileModal();
    let input = document.querySelector('#save-editor-save-file-set-filename-input');
    let filename = "output.md";
    if (input.value.trim().length > 0) {
      filename = input.value;
      setOutputFilename(input.value);
    }
    const content = props.contentGetter();
    const saveFile = document.createElement("a");
    let contentBlob = new Blob([content], {type: 'application/x-binary'});
    saveFile.href = URL.createObjectURL(contentBlob);
    saveFile.download = filename;
    saveFile.click();
    setTimeout(() => URL.revokeObjectURL(saveFile.href), 60000);
  }
  
  async function onSaveToFile() {
    disableActionBtn();
    // https://stackoverflow.com/a/67806663
    // https://stackoverflow.com/a/65050772
    try {
      const content = props.contentGetter();
      // window.showSaveFilePicker only available with HTTPS or localhost.
      // Thus hosting this app on HTTP will jump to the else case,
      // which may trigger browser warning about insecure file.
      if (window.showSaveFilePicker) {
        const handle = await showSaveFilePicker();
        const writable = await handle.createWritable();
        await writable.write( content );
        writable.close();
      }
      else {
        showSaveFileModal();
      }
    } catch(error) {
      console.log("Save To File Canceled");
    }
    enableActionBtn();
  }
  
  async function onSaveToServer(event) {
    event.preventDefault();
    
    disableActionBtn();
    let input = document.querySelector('#save-editor-save-server-input');
    let prompt = document.querySelector('#save-editor-save-server-prompt');
    let body = {
      path: input.value,
      content: props.contentGetter(),
    };
    try {
      let resp = await axios.post(
        `${env.BACKEND_URL}/api/savetoserver`,
        body,
        {withCredentials:true}
      );
      props.setErrorMsg(null);
      prompt.style.display = 'inline-block';
      prompt.style.animation = null;
      setTimeout(() => {prompt.style.animation = 'fadeout-animate 2.5s forwards';}, 1);
    } catch (error) {
      let error_msg = 'Cannot reach server';
      if (error.response) {
        error_msg = error.response.data.message;
        if (error.response.status === 401) {
          props.navigate(`/login?reason=401`)
          return;
        } else if (error.response.status === 404) {
          error_msg = "Server Response 404 Not Found, Maybe SaveToServer is Disabled";
        }
      }
      console.error(`Error: ${error_msg}`);
      props.setErrorMsg(`Error: ${error_msg}`);
      // scroll to top after 1ms
      setTimeout(_ => window.scrollTo(0, 0), 1);
    }
    enableActionBtn();
  }
  
  return (
    <Container fluid>
      <Row className="py-1">
        <Col
          lg={6} md={6} sm={12} xs={12}
          className="px-0 mx-0"
        >
          <Button
            key={"save-editor-save-file-btn"}
            id={"save-editor-save-file-btn"}
            className="action-btn"
            onClick={onSaveToFile}
          >
            Save To File
          </Button>
        </Col>
        
        <Modal
          show={saveFileModalState}
          onHide={hideSaveFileModal}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Form onSubmit={onSaveToFile_SaveBtnClick}>
            <Modal.Header closeButton>
              Save File
            </Modal.Header>
            <Modal.Body>
              <Form.Control
                type="text"
                id="save-editor-save-file-set-filename-input"
                key="save-editor-save-file-set-filename-input"
                aria-describedby="save-editor-save-file-set-filename-input"
                placeholder={outputFilename ? outputFilename : "Enter Filename"}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button type="submit">Save</Button>
            </Modal.Footer>
          </Form>
      </Modal>
      
      </Row>
      
      {
      props.isServerReady ?
      <div className="px-0 mx-0">
        <Form
          key={"save-editor-save-server-form"}
          id={"save-editor-save-server-form"}
          onSubmit={onSaveToServer}
        >
          <Row>
            <Col
              lg={6} md={6} sm={12} xs={12}
              className="py-2 px-0 mx-0"
            >
              <Form.Control
                type="input"
                key={"save-editor-save-server-input"}
                id={"save-editor-save-server-input"}
                placeholder="Server File Path"
              />
            </Col>
          </Row>
          <Row className="py-1">
            <Col
              lg={6} md={6} sm={12} xs={12}
              className="px-0 mx-0 d-flex align-items-center"
            >
              <Button
                type="submit"
                key={"save-editor-save-server-btn"}
                id={"save-editor-save-server-btn"}
                className="action-btn"
              >
                Save To Server
              </Button>
              <Form.Text
                as="div"
                key={"save-editor-save-server-prompt"}
                id={"save-editor-save-server-prompt"}
                style={{color:"green", fontWeight:"bold", fontSize:"x-large", display:"none"}}
                className="px-1 mx-1 fadeout-static"
              >
                Success!
              </Form.Text>
            </Col>
          </Row>
        </Form>
      </div>
      :
      <Row as="div">Server Not Ready</Row>
      }
      
    </Container>
  );
}

export default SaveEditorContentForm