import { useState } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import env from '../env';
import RequestEditor from './RequestEditor';



function createOptionUI(id_prefix, options) {
  let output = []
  for (let i = 0; i < options.length; ++i) {
    if (options[i].type === 'binary') {
      output.push(
        <Form.Group className="mb-3" key={`${id_prefix}-${options[i].name}-group-elem-${i+1}`}
          id={`${id_prefix}-${options[i].name}-group-elem-${i+1}`}
        >
          <Form.Check
            type={'checkbox'}
            label={`${options[i].name}`}
            key={`${id_prefix}-${options[i].name}-checkbox-value`}
            id={`${id_prefix}-${options[i].name}-checkbox-value`}
          />
        </Form.Group>
      );
    }
    else if (options[i].type.constructor.name === 'Array') {
      output.push(
        <Form.Group className="mb-3" key={`${id_prefix}-${options[i].name}-group-elem-${i+1}`}
          id={`${id_prefix}-${options[i].name}-group-elem-${i+1}`}
        >
          <Form.Label key={`${id_prefix}-${options[i].name}-label`}>
            {options[i].name}
          </Form.Label>
          <Form.Select aria-label={`${id_prefix}-${options[i].name}-value`}
            id={`${id_prefix}-${options[i].name}-value`}
          >
            {options[i].type.map((t,map_idx) => {
              return <option key={`${t}-opt-${map_idx}`} value={t}>{t}</option>
            })}
          </Form.Select>
        </Form.Group>
      );
    }
    else if (options[i].type === 'input') {
      output.push(
        <Form.Group className="mb-3" key={`${id_prefix}-${options[i].name}-group-elem-${i+1}`}
          id={`${id_prefix}-${options[i].name}-group-elem-${i+1}`}
        >
          <Form.Label>{options[i].name}</Form.Label>
          <Form.Control
            type="text"
            id={`${id_prefix}-${options[i].name}-value`}
            key={`${id_prefix}-${options[i].name}-value`}
            aria-describedby={`${id_prefix}-${options[i].name}-input`}
          />
        </Form.Group>
      );
    }
  }
  return output;
}

function createFormSubmitHandler(name, currentRequestOptions, result_handler, setErrorMsg, navigate) {
  return function (event) {
    event.preventDefault();
    
    let values = {};
    let form = document.querySelector(`form[id*="${name}"]`);
    document.querySelectorAll('.action-btn').forEach(a => {a.disabled = true;});
    form.querySelectorAll(`[id*="group-elem"]`).forEach(group => {
      let group_meta = group.getAttribute('id');
      group_meta = group_meta.replace(`${name}-`, '').split('-');
      let k = group_meta[1];
      let v = group.querySelector('[id$="value"]');
      if (v.type === 'checkbox') {
        values[k] = v.checked;
      } else {
        values[k] = v.value;
      }
    });
    
    let url = values['url'];
    delete values['url'];
    let body = {
      "url": url,
      "runner": name,
      "runner_options": values,
      "request_options": currentRequestOptions
    };
    axios.post(
      `${env.BACKEND_URL}/api/extract`,
      body,
      {withCredentials:true}
    ).then(resp => {
      result_handler(resp.data.content);
      setErrorMsg(null);
      document.querySelectorAll('.action-btn').forEach(a => {a.disabled = false;});
    }).catch(error => {
      if (error.response.status === 401) {
        navigate(`/login?reason=401`)
        return;
      }
      console.error(error.response.data.message);
      setErrorMsg(error.response.data.message);
      document.querySelectorAll('.action-btn').forEach(a => {a.disabled = false;});
      // scroll to top after 1ms
      setTimeout(_ => window.scrollTo(0, 0), 1);
    });
  }
}

function MainForm(props) {
  let runners = props.runners;
  const [requestOptions, setRequestOptions] = useState(null);
  
  if (!runners || !props.isServerReady) {
    return (
      <div>Server Not Ready</div>
    )
  }
  
  let tabs = [];
  Object.keys(runners).forEach((k,idx) => {
    tabs.push((
      <Tab eventKey={k} title={k} key={`${k}-tab-${idx}`}>
        <Container>
          <Form
            id={`${k}-form`}
            onSubmit={createFormSubmitHandler(k, requestOptions, props.contentSetter, props.setErrorMsg, props.navigate)}
          >
            <Row>
              <Form.Group
                className="mb-3"
                key={`${k}-${idx}-url-group-elem-0`}
                id={`${k}-${idx}-url-group-elem-0`}
              >
                <Form.Label>URL</Form.Label>
                <Form.Control
                  type="text"
                  id={`${k}-input-${idx}-value`}
                  key={`${k}-input-${idx}-value`}
                  aria-describedby={`${k}-input-${idx}`}
                  placeholder="Enter URL"
                />
              </Form.Group>
            </Row>
            
            <Row>
            {createOptionUI(`${k}-${idx}`, runners[k])}
            </Row>
            
            <Row>
              <Col
                lg={3} md={5} sm={12} xs={12}
                className="pb-1"
              >
                <RequestEditor request={requestOptions} setRequest={setRequestOptions}/>
              </Col>
              <Col>
                <Button
                  variant="primary"
                  type="submit"
                  key={`${k}-submit-${idx}`}
                  id={`${k}-submit-${idx}`}
                  className="action-btn"
                >
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </Tab>
    ));
  })
  
  return (
    <Tabs
      defaultActiveKey="default"
      id="form-tabs"
      className="mb-3"
      justify
    >
      {tabs}
    </Tabs>
  );
}

export default MainForm;