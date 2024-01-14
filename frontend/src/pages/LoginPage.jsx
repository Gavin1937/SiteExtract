import { useNavigate, useSearchParams } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import Cookies from 'js-cookie';
import { useState } from "react";
import { useEffect } from "react";


function LoginPage() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  useEffect(() => {
    let reason = searchParams.get("reason");
    if (reason === "401") {
      setErrorMsg("Unauthorized Credential");
    }
  }, [])
  
  function onFormSubmit(event) {
    event.preventDefault();
    
    let input = document.querySelector('#login-form-input');
    // expires in 60 days
    Cookies.set('siteextract_token', input.value, { expires: 60 });
    
    navigate("/");
  }
  
  return (
    <Container
      style={{ width: "33%", height: "60%" }}
      className="d-flex align-items-center justify-content-center text-center min-vh-100"
    >
      <Row>
        <Card>
          <Card.Body>
            {errorMsg ?
              (
                <Row
                  key={"login-error-prompt"}
                  id={"login-error-prompt"}
                  style={{ color: "red", fontWeight: "bold", fontSize: "x-large" }}
                  className="py-2 my-2"
                >
                  {errorMsg}
                </Row>
              )
              :
              (
                <Row>{null}</Row>
              )
            }
            <Card.Title>Login</Card.Title>
            <Form
              key={`login-form`}
              id={`login-form`}
              onSubmit={onFormSubmit}
            >
              <Form.Group
                className="mb-3"
                key={`login-form-group`}
                id={`login-form-group`}
              >
                <Form.Control
                  type="password"
                  id={`login-form-input`}
                  key={`login-form-input`}
                  placeholder="Enter Credential"
                />
              </Form.Group>
              
              <Button
                variant="primary"
                type="submit"
              >
                Save
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Row>
    </Container>
  )
}

export default LoginPage;