import JsonEditor from "@techfreaque/json-editor-react";
import { useState } from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';


function RequestEditor(props) {
  const schema = {
    "type": "object",
    "title": "HTTP Request Options",
    "multiple": false,
    "required": ["method", "headers", "cookies"],
    "properties": {
      "method": {
        "title": "Request Method",
        "enum": [
          "GET",
          "POST",
          "PUT",
          "DELETE"
        ],
        "type": "string",
        "fieldType": "selectlist",
        "displayType": "select",
        "isSearchable": false,
      },
      "headers": {
        "title": "Request Headers",
        "type": "array",
        "items": {
          "$ref": "#/definitions/header_item"
        }
      },
      "cookies": {
        "title": "Request Cookies",
        "type": "array",
        "items": {
          "$ref": "#/definitions/cookie_item"
        }
      }
    },
    "definitions": {
      "header_item": {
        "type": "object",
        "title": "Header",
        "plural_title": "Headers",
        "multiple": true,
        "properties": {
          "key": {
            "type": "string",
            "format": "text",
            "fieldType": "text",
            "isSearchable": false,
            "propertyOrder": 0
          },
          "value": {
            "type": "string",
            "format": "text",
            "fieldType": "text",
            "isSearchable": false,
            "propertyOrder": 1
          }
        },
        "definitions": {},
        "options": {
          "disable_collapse": true,
          "remove_empty_properties": true
        }
      },
      "cookie_item": {
        "type": "object",
        "title": "Cookie",
        "plural_title": "Cookies",
        "multiple": true,
        "properties": {
          "key": {
            "type": "string",
            "format": "text",
            "fieldType": "text",
            "isSearchable": false,
            "propertyOrder": 0
          },
          "value": {
            "type": "string",
            "format": "text",
            "fieldType": "text",
            "isSearchable": false,
            "propertyOrder": 1
          }
        },
        "definitions": {},
        "options": {
          "disable_collapse": true,
          "remove_empty_properties": true
        }
      }
    },
    "options": {
      "collapsed": false
    },
  };
  
  const startval = {
    "method": "GET",
    "headers": [],
    "cookies": []
  };
  
  const [modalState, setModalState] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  
  function getEditorContent() {
    const editor = window.$JsonEditors["Editor-1"]
    const editorValues = editor.getValue();
    let tmp = {
      method: editorValues.method,
      headers: {},
      cookies: {}
    };
    for (let kv of editorValues.headers) {
      if (kv.key && kv.value) {
        tmp.headers[kv.key] = kv.value;
      }
    }
    for (let kv of editorValues.cookies) {
      if (kv.key && kv.value) {
        tmp.cookies[kv.key] = kv.value;
      }
    }
    return tmp;
  }
  
  function setEditorContent(request) {
    const editor = window.$JsonEditors["Editor-1"]
    let tmp = {
      method: request.method,
      headers: [],
      cookies: []
    };
    for (let k in request.headers) {
      if (request.headers[k]) {
        tmp.headers.push({
          "key" : k,
          "value" : request.headers[k]
        });
      }
    }
    for (let k in request.cookies) {
      if (request.cookies[k]) {
        tmp.cookies.push({
          "key" : k,
          "value" : request.cookies[k]
        });
      }
    }
    props.setRequest(tmp);
  }
  
  // This is a dummy onChange function for <JsonEditor>
  // <JsonEditor> need this function to function properly
  function onRequestEditorChange() {
  }
  
  function showModal() {
    setModalState(true);
    if (isFirstTime) {
      setIsFirstTime(false);
    } else {
      setEditorContent(props.request ? props.request : startval);
    }
  }
  
  function hideModal() {
    setModalState(false);
    props.setRequest(getEditorContent());
  }
  
  
  // Known Issue:
  // 1)
  // In "Edit JSON" panel, once you entered an invalid json,
  // the underlying "json-editor" class will failed with
  // "Uncaught runtime error" when parsing this json.
  // We have no way to catch & handle that error.
  // Set the variable below to true if you don't need
  // "Edit JSON" panel.
  const disable_edit_json = false;
  
  
  return (
    <div>
      <Button variant="primary" onClick={showModal}>
        Edit HTTP Request Options
      </Button>
      <Modal
        show={modalState}
        onHide={hideModal}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
        </Modal.Header>
        <Modal.Body>
          <JsonEditor
            editorName={"Editor-1"}
            schema={schema}
            startval={props.request ? props.request : startval}
            onChange={onRequestEditorChange}
            
            ajax={false}
            theme={"bootstrap5"}
            collapsed={false}
            disable_properties={true}
            disable_edit_json={disable_edit_json}
            no_additional_properties={true}
            prompt_before_delete={false}
            remove_empty_properties={true}
            object_layout={"grid"}
            show_errors={"interaction"}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={hideModal}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default RequestEditor;