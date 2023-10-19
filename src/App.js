import React, { useState, useRef } from "react";
import { render } from "react-dom";
import * as XLSX from "xlsx";
import Chart from "react-apexcharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import { useEffect } from "react";
import { TwitterPicker } from "react-color";
import image_1 from "./image_1.webp";
import image_2 from "./image_2.jpg";

// Main App component
function App() {
  const [chartData, setChartData] = useState({});
  const [cardData, setCardData] = useState([]);
  const chartRef = useRef(null);
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [show, setShow] = useState(false);
  const [academicYear, setAcademicYear] = useState("");
  const [chartColor, setChartColor] = useState("#3366ff");

  // Update chart color
  const handleColorChange = (color) => {
    setChartColor(color.hex);
  };

  const downloadPDF = async () => {
    const element = chartRef.current;
    if (!element) {
      console.error("Invalid chart element reference.");
      return;
    }

    const canvas = await html2canvas(element, { scale: 2 }); // Increase the scale for better quality
    if (!canvas) {
      console.error("Failed to generate canvas.");
      return;
    }

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", [canvas.width, canvas.height]); // Use "l" for landscape mode
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("downloaded.pdf");
  };

  const generateGraphData = async (jsonData) => {
    const graphData = jsonData.map((data) => ({
      x: data[0],
      y: data[1],
    }));

    const updatedData = graphData.map((data) => {
      let updatedX = data.x;
      if (data.x.length > 20) {
        const words = data.x.split(" ");
        const lines = [];
        let currentLine = [];
        let wordCount = 0;

        words.forEach((word) => {
          if (
            currentLine.length < 4 &&
            currentLine.join(" ").length + word.length <= 20
          ) {
            currentLine.push(word);
            wordCount++;
          } else {
            lines.push(currentLine.join(" "));
            currentLine = [word];
            wordCount = 1;
          }
        });

        if (currentLine.length > 0) {
          lines.push(currentLine.join(" "));
        }

        updatedX = lines;
      }
      return {
        ...data,
        x: updatedX,
      };
    });

    setCardData(graphData); // Store the initial graphData in cardData

    return updatedData; // Return the updatedData
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const graphData = await generateGraphData(jsonData);
      setChartData({
        series: [
          {
            data: graphData,
          },
        ],
        options: {
          chart: {
            type: "bar",
          },
          xaxis: {
            categories: graphData.map((data) => data.x),
          },
        },
      });
    };

    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    console.log(cardData, "card");
    if (faculty && department && academicYear) setShow(true);
    else setShow(false);
  }, [faculty, department, academicYear]);

  return (
    <>
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Card style={{ width: "500px" }}>
          <Card.Body>
            <Card.Title>Generate Graph</Card.Title>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Name Of Faculty</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter faculty"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Department</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Academic Year</Form.Label>
              <Form.Control
                type="text"
                placeholder="2023-2024"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Choose Bar Color</Form.Label>
              <br />
              <TwitterPicker
                color={chartColor}
                onChangeComplete={handleColorChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Upload File</Form.Label>
              <Form.Control type="file" id="fileInput" />
            </Form.Group>

            {show && (
              <Button
                variant="primary"
                className="w-100"
                type="button"
                onClick={() => {
                  const input = document.getElementById("fileInput");
                  if (input.files.length > 0) {
                    handleFileUpload({ target: { files: [input.files[0]] } });
                  }
                }}
              >
                Submit
              </Button>
            )}
            {cardData && cardData.length > 0 && (
              <Button
                variant="primary"
                className="w-100 mt-2"
                onClick={downloadPDF}
              >
                Download PDF
              </Button>
            )}
          </Card.Body>
        </Card>
      </Container>
      <Container
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          padding: "2rem",
        }}
      >
        <div>
          <div ref={chartRef}>
            <div style={{ margin: "5rem" }}>
              {chartData.series && (
                <>
                  <Container
                    style={{ border: "1px solid #ced4da", padding: "20px" }}
                  >
                    <Row>
                      <Col xs={3}>
                        <img
                          src={image_1}
                          alt="First"
                          style={{ width: "12rem", height: "auto" }}
                        />
                      </Col>
                      <Col xs={6}>
                        <p style={{ textAlign: "center", fontSize: "bold" }}>
                          CHILDREN’S EDUCATIONAL SOCIETY
                        </p>
                        <h2 style={{ textAlign: "center" }}>
                          THE OXFORD COLLEGE OF SCIENCE
                        </h2>
                        <p style={{ textAlign: "center", fontSize: "bold" }}>
                          HSR Layout, Bengaluru-560102
                        </p>
                      </Col>
                      <Col xs={3}>
                        <img
                          src={image_2}
                          alt="Last"
                          style={{
                            width: "15rem",
                            height: "7rem",
                            marginTop: "1.5rem",
                          }}
                        />
                      </Col>
                    </Row>
                  </Container>
                  <h2 style={{ textAlign: "center", marginTop: "3rem" }}>
                    Feedback Form
                  </h2>

                  <Row style={{ margin: "3rem 0rem" }}>
                    <Col>
                      <p>
                        <b>Name Of Faculty: {faculty}</b>
                      </p>
                      <p>
                        <b>Department: {department}</b>
                      </p>
                    </Col>
                    <Col className="text-end">
                      <p>
                        <b>Academic Year: {academicYear}</b>
                      </p>
                    </Col>
                  </Row>

                  <Chart
                    options={{
                      ...chartData.options,
                      colors: [chartColor],
                      xaxis: {
                        ...chartData.options.xaxis,
                        tickPlacement: "on",
                        labels: {
                          style: {
                            colors: "#000000",
                            fontSize: "8px",
                            maxWidth: 200,
                          },
                          offsetY: 2,
                          wrap: true,
                          rotate: -90,
                        },
                        title: {
                          text: "Label",
                          style: {
                            fontSize: "14px",
                            fontWeight: 600,
                            cssClass: "apexcharts-xaxis-title",
                          },
                        },
                      },
                      yaxis: {
                        title: {
                          text: "Average Score",
                          style: {
                            fontSize: "14px",
                            fontWeight: 600,
                            cssClass: "apexcharts-yaxis-title",
                          },
                        },
                      },
                    }}
                    series={chartData.series}
                    type="bar"
                    height="auto"
                  />
                </>
              )}
              <Row>
                {cardData.map((data, index) => (
                  <Col key={index} md={4} style={{ marginBottom: 20 }}>
                    <Card className="d-flex h-100 flex-column">
                      <Card.Body>
                        <Card.Text
                          style={{ fontWeight: "bold", textAlign: "left" }}
                        >
                          {data.x}
                        </Card.Text>
                        <Card.Text
                          style={{
                            fontWeight: "bold",
                            textAlign: "left",
                            color: "green",
                          }}
                        >
                          {data.y}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}

export default App;
