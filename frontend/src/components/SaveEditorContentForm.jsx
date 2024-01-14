import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import BACKEND_URL from '../env';
import '../css/fadeout.css';


function SaveEditorContentForm(props) {
  
  function disableActionBtn() {
    document.querySelectorAll('.action-btn').forEach(a => {a.disabled = true;});
  }
  
  function enableActionBtn() {
    document.querySelectorAll('.action-btn').forEach(a => {a.disabled = false;});
  }
  
  async function onSaveToFile() {
    disableActionBtn();
    // https://stackoverflow.com/a/67806663
    try {
      const content = props.contentGetter();
      if (window.showSaveFilePicker) {
        const handle = await showSaveFilePicker();
        const writable = await handle.createWritable();
        await writable.write( content );
        writable.close();
      }
      else {
        const saveFile = document.createElement("a");
        saveFile.href = URL.createObjectURL( content );
        saveFile.download= "output.md";
        saveFile.click();
        setTimeout(() => URL.revokeObjectURL(saveFile.href), 60000 );
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
    prompt.style.display = 'inline-block';
    prompt.style.animation = null;
    let body = {
      path: input.value,
      content: props.contentGetter(),
    };
    try {
      let resp = await axios.post(
        `${BACKEND_URL}/api/savetoserver`,
        body,
        {withCredentials:true}
      );
      props.setErrorMsg(null);
    } catch (error) {
      console.error(`Error: ${error.response.data.message}`);
      if (error.response.status === 401) {
        props.navigate(`/login?reason=401`)
        return;
      }
      props.setErrorMsg(`Error: ${error.response.data.message}`);
      // scroll to top after 1ms
      setTimeout(_ => window.scrollTo(0, 0), 1);
    }
    enableActionBtn();
    prompt.style.animation = 'fadeout-animate 2.5s forwards';
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