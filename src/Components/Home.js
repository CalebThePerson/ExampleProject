import axios from 'axios'
import cheerio from 'cheerio'
import {useState, useEffect} from 'react'


export default function Home() {
    const [show, setShow] = useState(false)
    const [loggedIn, setStatus] = useState(false)
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('')
    const [error, setError] = useState('')


    const [assignemnts, setAssignments] = useState([])
    const [classes, setClasses] = useState([])


    var showPassword = false

    //UseState functions here
    const changeEmail = (event) =>{
        setEmail(event.target.value)
    }

    const changePass = (event) =>{
        setPass(event.target.value)
    }

    const change = (event) => {
        setShow(true)
    }

    //API functions here
    async function schoolLogin(event){
        const pog = await axios('/school_login')
    }

    async function login(event){

        event.preventDefault()
        const email = 'EMAIL HERE'
        const password = 'PASSWORD HERE'
        //This one logs into gradescope with the following information
        const message = await axios('http://localhost:3001/login?email=' + email + '&pass=' + password)
        console.log(message)

        setShow(true)
        setStatus(true)
    }

    async function pullClasses(){
        const classData = await axios('http://localhost:3001/get_classes')
        const parsed = await parseClasses(classData['data'])
        setClasses(parsed)
        console.log(parsed)
    }

    async function parseClasses(data) {
        //Makes the Call to the server which then returns all the html data of all the classes found on the home page
        //Then we upload it to the cheerio module in order to parse it
        var $ = await cheerio.load(data)
        let classes = []
    
        //We then create a new variable with the first courseList courses for term
        //This is my solution to preventing the code from grabbing all of the classes we have for the entire year 
        //and making it give us our classes for this sesmeseter
        const pog = $('.courseList--coursesForTerm')[0]
        $ = await cheerio.load(pog)
    
        //Then we take all the items with the class courseBox, and since we are only looking in one div it will pull the ones for this 
        //sesmester
        $('.courseBox').each((i,elem) => {
            classes.push({
                number: $(elem).attr('href'),
                shortName:  $(elem).find('.courseBox--shortname').text(),
                name: $(elem).find('.courseBox--name').html()
            })
        })
    
        //This removes the last entry because the last entry is always the add courses box in gradescope
        classes.pop()
        return(classes)
    }

    async function getAssignments() {

        let allAssignments = []
        for(let i = 0; i< classes.length; i++){
            if(classes[i].number === 'Loading'){
            
            } else {
                const data = await axios('http://localhost:3001/get_assignments?id=' + classes[i].number)
                let parsedData = parseAssignments(classes[i].name ,data['data'])
                allAssignments.push(classes[i] ,parsedData)
            }
        }
        console.log(allAssignments)
        setAssignments(allAssignments)
        
    }

    async function parseAssignments(className, data){
        let tempList = [{}]
        // const data = await axios('/get_assignments?id=' + classes[i].number)
        const $ = await cheerio.load(data)
        let assignments = []
    
        $('tr[role=row]').each((i,elem) => {
            assignments.push({
                name: $(elem).find('a').text(),
                submissionStatus: $(elem).find('.submissionStatus--text').text(),
                dueData: $(elem).find('.submissionTimeChart--dueDate').text()
            })
        })
    
        assignments.shift()
        let pog = {
            name: className,
            assignments: assignments
        }

    //For right now all this does is just prints this in the console because i dont want to overflow the page with all my assignments
        // console.log(pog)
        return(pog)   
        }



    //React functions here
    useEffect(() => {
    }, []);

    if (loggedIn) {
        //If i turn this section into a component maybe I can use, UseEffect in order to load classes on page render
        return (
            <div >
            <table>
                <tr>
                {classes.map((item) =>(
                    <th onClick = {()=> getAssignments(item.number)} >{item.name}</th>
                    // <button onClick = {()=> getAssignments(item.number)}>{item.name}</button>
                ))}
                </tr>
                {assignemnts.map((item) =>
                console.log(item)                 
                )}
            </table>
            <button type = 'submit' onClick = {pullClasses}>PullClasses</button>
            <button type = 'submit' onClick = {getAssignments}>Get assignments</button>
        </div>
 
        )
    } else{
        return (
            <div>
                <form>
                <h1 className = 'top'> Log-in Page </h1>
                        <div className = 'form-group'>
                            <h3> Username </h3>
                            <input type = 'text' className = 'form-control' value = {email} placeholder='JohnDoe@gmail.com' onChange={changeEmail}></input>
                        </div>
    
                        <div className = 'form-group'>
                            <h3> Password </h3>
                            <input type = 'text' className = 'form-control' id = 'password' value ={pass} placeholder='pogchamp' onChange={changePass}></input>
                        </div>
    
                        <button type="submit" class="btn btn-primary" onClick ={login} >Submit</button>
    
                </form>
            </div>

        )
    }
}