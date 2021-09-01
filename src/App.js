import React, { PureComponent } from 'react';
import { Container, Col, Row, Alert, Form, Button } from 'react-bootstrap';
import 'react-virtualized/styles.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, } from 'recharts';


const tasks = [...Array(100).keys()];
tasks.shift();
const times = [];
tasks.forEach(element => times.push(element*10));

function Element(props){ 
         return <div style={{border:'1px solid lightgrey', padding:10, marginBottom:10}}>
                     <h4>{props.title}</h4>
                      <Form>
                          <Form.Label>{props.select}</Form.Label>
                            <Form.Control as="select" onChange={props.taskChange}>
                                {tasks.map((value, index) => {return <option key={value+'_'+index.toString()}>{value}</option>})}
                            </Form.Control>
                          
                          <div style={{display:props.showThis}}>
                          <Form.Label>{props.setTime}</Form.Label>
                            <Form.Control as="select" onChange={props.timeChange}>
                                {times.map((value, index) => {return <option key={value+'_'+index.toString()}>{value}</option>})}
                            </Form.Control>
                          </div>

                           <Button variant="primary" type="submit" style={{marginTop:10}} onClick={props.taskSubmit}>Submit</Button>
                        </Form>
                         <Alert variant="primary" show={props.setShow} style={{marginBottom:0, paddingBottom:0}}>
                             <Alert.Heading>{props.taskExist}</Alert.Heading></Alert>
                  </div>;
}


class App extends PureComponent {
    constructor(props) {
         super();
         this.state = {error: null,
                       items: [],
                       setTask:1,
                       setTime:10,
                       setShow:false,
                       updateShow: false,
                       deleteShow: false,
                      }
        
        this.setTaskChange = this.setTaskChange.bind(this);  
        this.setTimeChange = this.setTimeChange.bind(this);  
        this.handleSetSubmit = this.handleSetSubmit.bind(this);  
        this.handleTaskSubmit = this.handleTaskSubmit.bind(this); 
        this.handleDeleteSubmit = this.handleDeleteSubmit.bind(this); 
}
    
    componentDidMount() {
        this.timerID = setInterval(
            () => this.request("http://localhost:5000/data/",
                               "GET",
                               undefined,
                               {setShow:false, 
                                updateShow:false,
                                deleteShow: false},
                               {}), 3000
        );
        this.setState({setShow:false})
    }
    
    componentWillUnmount() {
        clearInterval(this.timerID);
    }
    
    request(path, method, body, newData, err) {
        fetch(path,
              {
            mode: "cors",
            method: method,
            body: body, 
            headers: {
                "Content-Type": "application/json"
            },
        }).then(res => res.json())
            .then((data) => {
            if (newData)
                this.setState({items: data, ...newData});
        },(error) => {
            this.setState(err)
        }
      )
   }
    
    setTaskChange(event){
        this.setState({setTask:event.target.value});
    }
    
    setTimeChange(event){
        this.setState({setTime:event.target.value});
    }
    
    handleSetSubmit(event) {
        event.preventDefault();
        this.request("http://localhost:5000/tasks/"+this.state.setTask,
                     "PUT",
                     JSON.stringify({task:this.state.setTask, time:this.state.setTime}),
                     false,
                     {updateShow: true})
    }
    
    handleTaskSubmit(event) {
        event.preventDefault();
        this.request("http://localhost:5000/tasks",
                     "POST",
                     JSON.stringify({task:this.state.setTask, time:this.state.setTime}),
                     false,
                     {setShow: true})
    }
    
    handleDeleteSubmit(event) {
        event.preventDefault();
        this.request("http://localhost:5000/tasks/"+this.state.setTask,
                     "DELETE",
                     JSON.stringify({task:this.state.setTask, time:this.state.setTime}),
                     false,
                     {deleteShow: true})
    }
   
    render() {
        let data = this.state.items.result;
        return (
            <div className="App">
               <Container fluid style={{marginTop:50}}>
                  <Row>
                    <Col sm={4}>
            
                    {/* создание работы POST */}
                    <Element title='CREATE JOB (POST)' select='Select task' taskChange={this.setTaskChange}
                      setTime='Set time' timeChange={this.setTimeChange} taskSubmit={this.handleTaskSubmit}
                      setShow={this.state.setShow} taskExist='This task exists' showThis='block'/>  
            
                    {/* обновление работы PUT */}
                    <Element title='UPDATE JOB (PUT)' select='Select task' taskChange={this.setTaskChange}
                     setTime='Set time' timeChange={this.setTimeChange} taskSubmit={this.handleSetSubmit}
                     setShow={this.state.updateShow} taskExist='This task does not exist' showThis='block'/>
            
                    {/* удаление работы DELETE */}
                    <Element title='DELETE JOB (DELETE)' select='Select task' taskChange={this.setTaskChange}
                     setTime='Set time' timeChange={this.setTimeChange} taskSubmit={this.handleDeleteSubmit}
                     setShow={this.state.deleteShow} taskExist='This task does not exist' showThis='none'/>
            
                     </Col>
                        <Col sm={8}>
                          <h4 style={{textAlign:'center'}}>WORK MONITORING</h4>
                           <BarChart width={1200} height={800} data={data}
                               margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                                  <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="task"/>
                                      <YAxis/>
                                       <Tooltip/>
                                      <Legend />
                                    <Bar dataKey="time" fill="blue" />
                             </BarChart>
                         </Col>
                  </Row>
               </Container>
            </div>
        )
    }
}

export default App;