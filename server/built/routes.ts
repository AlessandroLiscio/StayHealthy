import { Request, Response } from 'express'
import { CustomError } from './models/customError'
import { Patient } from './models/models'
import * as controllers from './controllers/controllers'
import * as url from 'url'
import * as path from 'path'

module.exports = function (app, passport) {

    // variables used for the responses
    var serverResponse: any
    var error: CustomError = new CustomError()

    // initialize all the tables controllers
    var choiceCtrl = new controllers.ChoiceCtrl()
    var doctorCtrl = new controllers.DoctorCtrl()
    var messageCtrl = new controllers.MessageCtrl()
    var mibandCtrl = new controllers.MibandCtrl()
    var patientCtrl = new controllers.PatientCtrl()
    var patientSurveyCtrl = new controllers.PatientSurveyCtrl()
    var questionCtrl = new controllers.QuestionCtrl()
    var surveyCtrl = new controllers.SurveyCtrl()
    var userCtrl = new controllers.UserCtrl()


    //------------------------UNAUTHORIZED RESPONSE MESSAGES--------------------------//
    function sendUnauthorizedResponse(res: Response) {
        res.status(401).send({ ErrorMessage: 'You are not authorized to call this function' })
    }

    //------------------------LOGIN RESPONSE MESSAGES--------------------------//
    function handleLoginResponse(res: Response, code: number, serverResponse: any) {
        res.status(code).send({ ServerResponse: serverResponse })
    }

    function sendServerResponse(req: Request, res: Response, serverResponse: any) {
        switch (req.method) {
            //------------------------GET RESPONSE MESSAGES--------------------------//
            case 'GET': {
                // standard response message
                let stdGetErrMsg = 'Error: could not find any result for input data.'
                // if serverResponse has not been istantiated, return ErrorMessage
                if (!serverResponse) {
                    res.status(500).send({ ErrorMessage: stdGetErrMsg })
                    return
                }
                // if serverResponse is a custom error, return it to show the error
                if (serverResponse instanceof CustomError) {
                    res.status(500).send({ ErrorMessage: serverResponse })
                    return
                }
                // if serverResponse is an error, return it to show the error
                if (serverResponse instanceof Error) {
                    res.status(500).send(serverResponse)
                    return
                }
                // else return it to show the data
                res.status(200).send(serverResponse)
                return
            }
            //------------------------POST RESPONSE MESSAGES--------------------------//
            case 'POST': {
                // standard response messages
                let stdPostErrMsg = 'Error: could not update database with input data.'
                let stdPostSuccessMsg = 'Success: data correctly added to the database'
                // if serverResponse is an error, return it to show the error
                if (serverResponse instanceof Error) {
                    res.status(500).send({ ErrorMessage: serverResponse })
                    return
                }
                // if serverResponse is a custom error, return it to show the error
                if (serverResponse instanceof CustomError) {
                    res.status(500).send({ ErrorMessage: serverResponse })
                    return
                }
                // if serverResponse has been instantiated (and not an error), return SuccessMessage
                if (serverResponse) {
                    res.status(200).send({ SuccessMessage: stdPostSuccessMsg, ServerResponse: serverResponse })
                    return
                }
                // else, return standar error message
                res.status(500).send({ ErrorMessage: stdPostErrMsg })
                return
            }
            //------------------------DELETE RESPONSE MESSAGES--------------------------//
            case 'DELETE': {
                // standard response message
                let stdDeleteErrMsg = 'Error: could not delete input data.'
                let stdDeleteSuccessMsg = 'Success: data correctly deleted from the database'
                // if serverResponse is an error, return it to show the error
                if (serverResponse instanceof Error) {
                    res.status(500).send({ ErrorMessage: serverResponse })
                    return
                }
                // if serverResponse is a custom error, return it to show the error
                if (serverResponse instanceof CustomError) {
                    res.status(500).send({ ErrorMessage: serverResponse })
                    return
                }
                // if serverResponse has been instantiated (and not an error), return SuccessMessage
                if (serverResponse) {
                    res.status(200).send({ SuccessMessage: stdDeleteSuccessMsg })
                    return
                }
                // else, return standar error message
                res.status(500).send({ ErrorMessage: stdDeleteErrMsg })
            }
            default: {
                return res.status(500).send({ ErrorMessage: 'Could not manage server response' })
            }
        }
    }

    //--------------------------------------------------------APPLICATION------------------------------------------
    app.get(/^((?!\/api).)*$/, (req: Request, res: Response, next) => {
        res.sendFile(path.join(__dirname, '../public/index.html'))
    })

    //------------------------------------------------------/api/login-------------------------------------------//
    // GET login
    app.get('/api/login', function (req: Request, res: Response) {
        if (req.isAuthenticated()) {
            res.status(200).send({ SuccessMessage: 'Congrats, you are authenticated', User: req.user })
        }
        else {
            res.status(200).send({ ErrorMessage: 'Damn, you are not authenticated' })
        }

    })

    //POST login
    app.post('/api/login', loginRedirect, function (req: Request, res: Response, next: any) {
        passport.authenticate('local-login', { failureFlash: true }, (err, user) => {
            // if an error occurs while trying to authenticate the user, return the error
            if (err) { handleLoginResponse(res, 500, err) }
            // if user has not been found, send an error response
            if (!user) { handleLoginResponse(res, 404, 'Wrong username or password') }
            // if user has been found and password matches, attemp to log in
            if (user) {
                req.login(user, function (err) {
                    // if an error occurs in the login function, return the error
                    if (err) {
                        console.log(err)
                        return handleLoginResponse(res, 500, 'error')
                    }
                    // if authenticated, return the user's role
                    else handleLoginResponse(res, 200, req.user.role)
                })
            }
        })(req, res, next)
    })

    //------------------------------------------------------/api/logout-------------------------------------------//
    //GET logout
    app.get('/api/logout', isLoggedIn, function (req, res) {
        if (!(req.isAuthenticated())) {
            res.status(500)
                .send({ ErrorMessage: 'You have to be logged in to log out' })
            return
        }
        req.logout()
        if (!(req.isAuthenticated())) {
            res.status(200)
                .clearCookie('connect.sid', { path: '/' })
                .send({ SuccessMessage: 'Successfully logged out' })
        } else {
            res.status(500)
                .send({ ErrorMessage: 'Error encountered while attemping to log out' })
        }
    })

    //------------------------------------------------------/api/choice-------------------------------------------//

    // GET choice
    app.get('/api/choice', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await choiceCtrl.getChoice(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })
    // POST choice
    app.post('/api/choice', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await choiceCtrl.postChoice(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })

    //------------------------------------------------------/api/doctor-------------------------------------------//
    // GET doctor
    app.get('/api/doctor', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await doctorCtrl.getDoctor(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })
    // GET doctor's patients
    app.get('/api/doctor/patients', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await doctorCtrl.getDoctorPatients(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })

    //------------------------------------------------------/api/message-------------------------------------------//

    // GET message
    app.get('/api/message', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await messageCtrl.getMessage(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })
    // POST message
    app.post('/api/message', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        req.body.sender = req.user.username
        try {
            serverResponse = await messageCtrl.postMessage(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })
    // DELETE message
    app.delete('/api/message', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await messageCtrl.deleteMessage(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })
    // GET user's messages
    app.get('/api/messages/user', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await messageCtrl.getUserMessages(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })

    //------------------------------------------------------/api/miband-------------------------------------------//
    // GET miband
    app.get('/api/miband', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await mibandCtrl.getData(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })
    // POST miband
    app.post('/api/miband', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await mibandCtrl.postData(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })

    //------------------------------------------------------/api/patient-------------------------------------------//
    // GET patient
    app.get('/api/patient', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await patientCtrl.getPatient(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })
    // GET patient's doctor
    app.get('/api/patient/doctor', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await patientCtrl.getPatientDoctor(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })
    //------------------------------------------------------/api/patient_survey-------------------------------------------//
    // GET patient's survey
    app.get('/api/patient_survey', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await patientSurveyCtrl.getPatientSurvey(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })
    // POST patient's survey
    app.post('/api/patient_survey', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await patientSurveyCtrl.postPatientSurvey(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })
    // GET all the patient's surveys
    app.get('/api/patient_survey/all', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await patientSurveyCtrl.getPatientSurveys(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })
    //------------------------------------------------------/api/question-------------------------------------------//

    // GET question
    app.get('/api/question', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await questionCtrl.getQuestion(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })
    // POST question
    app.post('/api/question', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await questionCtrl.postQuestion(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })

    //------------------------------------------------------/api/survey-------------------------------------------//
    // GET survey
    app.get('/api/survey', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await surveyCtrl.getSurvey(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })
    // POST Survey
    app.post('/api/survey', isLoggedIn, isAuthorized, async (req: Request, res: Response) => {
        try {
            serverResponse = await surveyCtrl.postSurvey(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })

    //------------------------------------------------------/api/user-------------------------------------------//
    // GET user
    app.get('/api/user', async (req: Request, res: Response) => {
        try {
            serverResponse = await userCtrl.getUser(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })
    // POST user
    app.post('/api/user', async (req: Request, res: Response) => {
        try {
            serverResponse = await userCtrl.postUser(req)
            sendServerResponse(req, res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err)
        }
    })

    // ==========================================================================================================================================================
    // ==============================================   OTHER FUNCTIONS   =======================================================================================
    // ==========================================================================================================================================================

    /*
    * routes middleware to ensure user is logged in
    */
    function isLoggedIn(req, res, next) {
        // if not authenticated, return error message
        if (!(req.isAuthenticated())) {
            return res.status(401)
                .send({ ErrorMessage: 'You need to be logged in to call this function' })
        }
        // check-in passed
        return next()
    }

    /*
    * routes middleware to check user is logged in
    */
    function loginRedirect(req, res, next) {
        // if authenticated, return error message
        if (req.isAuthenticated()) {
            return res.status(401)
                .send({ ServerResponse: 'You are already logged in' })
        }
        // check-in passed
        return next()
    }

    /*
    * check user's authorization to call function by checking role
    */
    async function isAuthorized(req, res, next) {
        // parse url to get the pathname and save it into route
        let url_parts = url.parse(req.url)
        let route = url_parts.pathname
        switch (req.method) {
            //======================================== 'GET' ======================================== //
            case 'GET': {
                switch (req.user.role) {
                    //============================== 'GET && patient' ==============================//
                    case 'patient': {
                        switch (route) {
                            case '/api/messages/user': {
                                req.query.receiver = req.user.username
                                return next()
                            }
                            case '/api/miband': {
                                req.query.patient_ssn = req.user.username
                                return next()
                            }
                            case '/api/patient': {
                                req.query.patient_ssn = req.user.username
                                return next()
                            }
                            case '/api/patient/doctor': {
                                req.query.patient_ssn = req.user.username
                                return next()
                            }
                            case '/api/patient_survey': {
                                req.query.patient_ssn = req.user.username
                                return next()
                            }
                            case '/api/patient_survey/all': {
                                req.query.patient_ssn = req.user.username
                                return next()
                            }
                            case '/api/survey': {
                                return next();
                            }
                            default: {
                                return sendUnauthorizedResponse(res)
                            }
                        }
                    }
                    //============================== 'GET && doctor' ==============================//
                    case 'doctor': {
                        switch (route) {
                            case '/api/doctor': {
                                req.query.doctor_ssn = req.user.username
                                return next()
                            }
                            case '/api/doctor/patients': {
                                req.query.doctor_ssn = req.user.username
                                return next()
                            }
                            case '/api/messages/user': {
                                req.query.receiver = req.user.username
                                return next()
                            }
                            case '/api/miband': {
                                if (await findInDoctorPatientsList(req.query.patient_ssn, req, res)) { return next() }
                                return
                            }
                            case '/api/patient': {
                                if (await findInDoctorPatientsList(req.query.patient_ssn, req, res)) { return next() }
                                return
                            }
                            case '/api/patient_survey': {
                                if (await findInDoctorPatientsList(req.query.patient_ssn, req, res)) { return next() }
                                return
                            }
                            case '/api/patient_survey/all': {
                                if (await findInDoctorPatientsList(req.query.patient_ssn, req, res)) { return next() }
                                return
                            }
                            case '/api/survey': {
                                //statements;
                                return next()
                            }
                            default: {
                                return sendUnauthorizedResponse(res)
                            }
                        }
                    }
                    //============================== 'GET && default' ==============================//
                    default: {
                        return sendUnauthorizedResponse(res)
                    }
                }
            }
            //======================================== 'POST' ======================================== //
            case 'POST': {
                switch (req.user.role) {
                    //============================== 'POST && patient' ==============================//
                    case 'patient': {
                        switch (route) {
                            case '/api/message': {
                                if (await checkPatientDoctor(req.query.receiver, req, res)) { return next() }
                                return
                            }
                            case '/api/miband': {
                                req.query.patient_ssn = req.user.username
                                return next()
                            }
                            case '/api/patient_survey': {
                                req.query.patient_ssn = req.user.username
                                return next()
                            }
                            default: {
                                return sendUnauthorizedResponse(res)
                            }
                        }
                        break
                    }
                    //============================== 'POST && doctor' ==============================//
                    case 'doctor': {
                        switch (route) {
                            case '/api/message': {
                                if (await findInDoctorPatientsList(req.query.receiver, req, res)) { return next() }
                                return
                            }
                            default: {
                                return sendUnauthorizedResponse(res)
                            }
                        }
                    }
                    //============================== 'POST && default' ==============================//
                    default: {
                        return sendUnauthorizedResponse(res)
                    }
                }
            }
            //======================================== 'DELETE' ======================================== //
            case 'DELETE': {
                switch (req.user.role) {
                    //============================== 'DELETE && patient' ==============================//
                    case 'patient': {
                        switch (route) {
                            case '/api/message': {
                                req.query.receiver = req.user.username
                                return next()
                            }
                            default: {
                                return sendUnauthorizedResponse(res)
                            }
                        }
                    }
                    //============================== 'DELETE && doctor' ==============================//
                    case 'doctor': {
                        switch (route) {
                            case '/api/message': {
                                req.query.receiver = req.user.username
                                return next()
                            }
                            default: {
                                return sendUnauthorizedResponse(res)
                            }
                        }
                    }
                    default: {
                        return sendUnauthorizedResponse(res)
                    }
                }
            }
            //============================== 'default' ==============================//
            default: {
                return sendUnauthorizedResponse(res)
            }
        }
    }

    /*
    * check if a given patient is present in the session doctor's patients list
    */
    async function findInDoctorPatientsList(patient: string, req, res) {
        // check if the receiver is a valid receiver for the doctor's message
        req.query.doctor_ssn = req.user.username
        let doctorPatients = await doctorCtrl.getDoctorPatients(req)
        // if an error occur while retrieving the patients list, return the error
        if (doctorPatients instanceof Error || doctorPatients instanceof CustomError) {
            res.status(500).send({ doctorPatients })
            return false
        } else {
            // check if the receiver is in the doctor's patients list
            let valid = false;
            for (let element of doctorPatients) {
                if (patient == element.patient_ssn) {
                    valid = true
                }
            }
            // if the receiver is not in the doctor's patients list, return the error
            if (!valid) {
                sendUnauthorizedResponse(res)
                return false
            }
        }
        return true
    }

    /*
    * check if a given doctor is the session user's doctor
    */
    async function checkPatientDoctor(doctor: string, req, res) {
        // check if the receiver is patient's doctor
        req.query.patient_ssn = req.user.username
        let patient = await patientCtrl.getPatient(req)
        // if an error occur while retrieving the patient, return the error
        if (!(patient instanceof Patient)) {
            res.status(500).send({ patient })
            return false
        } else {
            // if the receiver does not correspond to the patient's doctor, return the error
            if (!(doctor == patient.doctor_ssn)) {
                sendUnauthorizedResponse(res)
                return false
            }
        }
        return true
    }
}