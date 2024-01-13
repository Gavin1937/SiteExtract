import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import BACKEND_URL from '../env';


function SaveEditorContentForm(props) {
  
  async function onSaveToFile() {
    let btn = document.querySelector('#save-editor-save-file-btn');
    btn.disabled = true;
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
    btn.disabled = false;
  }
  
  async function onSaveToServer(event) {
    event.preventDefault();
    
    let btn = document.querySelector('#save-editor-save-server-btn');
    btn.disabled = true;
    let input = document.querySelector('#save-editor-save-server-input');
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
    btn.disabled = false;
  }
  
  return (
    <Container fluid>
      <Row className="py-1">
        <Col xs={2} className="px-0 mx-0">
          <Button
            key={"save-editor-save-file-btn"}
            id={"save-editor-save-file-btn"}
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
            <Col xs={3} className="py-2 px-0 mx-0">
              <Form.Control
                type="input"
                key={"save-editor-save-server-input"}
                id={"save-editor-save-server-input"}
                placeholder="Server File Path"
              />
            </Col>
          </Row>
          <Row className="py-1">
            <Col className="px-0 mx-0">
              <Button
                type="submit"
                key={"save-editor-save-server-btn"}
                id={"save-editor-save-server-btn"}
              >
                Save To Server
              </Button>
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