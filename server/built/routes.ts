import * as controllers from './controllers/controllers'
import { Request, Response } from 'express'
import { CustomError } from './models/customError'
import { Patient, SerializedUser } from './models/models'

module.exports = function (app, passport) {

    // variable used for the responses
    var serverResponse: any;
    var error: CustomError = new CustomError();

    //------------------------UNAUTHORIZED RESPONSE MESSAGES--------------------------//
    function sendUnauthorizedResponse(res: Response) {
        res.status(401).send({ ErrorMessage: 'You are not authorized to call this function' })
    }

    //------------------------LOGIN RESPONSE MESSAGES--------------------------//
    function handleLoginResponse(res: Response, code: number, serverResponse: any) {
        res.status(code).send({ ServerResponse: serverResponse });
    }

    //------------------------GET RESPONSE MESSAGES--------------------------//
    function sendGetResponse(res: Response, serverResponse: any) {
        // standard response message
        let stdErrMsg = 'Error: could not find any result for input data.';
        // if serverResponse has not been istantiated, return ErrorMessage
        if (!serverResponse) {
            res.status(500)
                .send({ ErrorMessage: stdErrMsg });
            return
        }
        if (serverResponse instanceof CustomError) {
            res.status(500)
                .send({ ErrorMessage: serverResponse });
            return
        }
        // if serverResponse is an error, return it to show the error
        if (serverResponse instanceof Error) {
            res.status(500)
                .send(serverResponse)
            return
        }
        // if serverResponse has been instantiated (and not an error), return it to show the data
        else {
            res.status(200)
                .send(serverResponse);
            return
        }
    }

    //------------------------POST RESPONSE MESSAGES--------------------------//
    function sendPostResponse(res: Response, serverResponse: any) {
        // standard response messages
        let stdErrMsg = 'Error: could not update database with input data.';
        let stdSuccessMsg = 'Success: data correctly added to the database';
        // if serverResponse is an error, return it to show the error
        if (serverResponse instanceof Error) {
            res.status(500)
                .send({ ErrorMessage: serverResponse })
            return
        }
        // if serverResponse is a string, send it as a custom error created from server
        if (serverResponse instanceof CustomError) {
            res.status(500)
                .send({ ErrorMessage: serverResponse })
            return
        }
        // if serverResponse has been instantiated (and not an error), return SuccessMessage
        if (serverResponse) {
            res.status(200)
                .send({ SuccessMessage: stdSuccessMsg, ServerResponse: serverResponse })
            return
        }
        // else, return standar error message
        res.status(500)
            .send({ ErrorMessage: stdErrMsg });
    }

    //------------------------DELETE RESPONSE MESSAGES--------------------------//
    function sendDeleteResponse(res: Response, serverResponse: any) {
        // standard response message
        let stdErrMsg = 'Error: could not delete input data.';
        let stdSuccessMsg = 'Success: data correctly deleted from the database';
        // if serverResponse is an error, return it to show the error
        if (serverResponse instanceof Error) {
            res.status(500)
                .send({ ErrorMessage: serverResponse })
            return
        }
        // if serverResponse is a string, send it as a custom error created from server
        if (serverResponse instanceof CustomError) {
            res.status(500)
                .send({ ErrorMessage: serverResponse })
            return
        }
        // if serverResponse has been instantiated (and not an error), return SuccessMessage
        if (serverResponse) {
            res.status(200)
                .send({ SuccessMessage: stdSuccessMsg })
            return
        }
        // else, return standar error message
        res.status(500)
            .send({ ErrorMessage: stdErrMsg });
    }

    //--------------------------------------------------------APPLICATION------------------------------------------
    var path = require('path');
    app.get(/^((?!\/api).)*$/, (req: Request, res: Response, next) => {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    })

    //------------------------------------------------------/api/login-------------------------------------------//
    // GET login
    app.get('/api/login', function (req: Request, res: Response) {
        if (req.isAuthenticated()) {
            res.status(200)
                .send({ SuccessMessage: 'Congrats, you are authenticated', User: req.user })
        }
        else {
            res.status(200)
                .send({ ErrorMessage: 'Damn, you are not authenticated' })
        }

    });

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
                    if (err) { console.log(err); return handleLoginResponse(res, 500, 'error') }
                    // if authenticated, return the user's role
                    else handleLoginResponse(res, 200, req.user.role);
                });
            }
        })(req, res, next);
    });

    //------------------------------------------------------/api/logout-------------------------------------------//
    //GET logout
    app.get('/api/logout', isLoggedIn, function (req, res) {
        if (!(req.isAuthenticated())) {
            res.status(500)
                .send({ ErrorMessage: 'You have to be logged in to log out' })
            return
        }
        req.logout();
        if (!(req.isAuthenticated())) {
            res.status(200)
                .clearCookie('connect.sid', { path: '/' })
                .send({ SuccessMessage: 'Successfully logged out' })
        } else {
            res.status(500)
                .send({ ErrorMessage: 'Error encountered while attemping to log out' })
        }
    });

    //------------------------------------------------------/api/choice-------------------------------------------//
    // GET choice
    app.get('/api/choice', isLoggedIn, async (req: Request, res: Response) => {
        let choiceCtrl = new controllers.ChoiceCtrl();
        try {
            serverResponse = await choiceCtrl.getChoice(req);
            sendGetResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });
    // POST choice
    app.post('/api/choice', isLoggedIn, async (req: Request, res: Response) => {
        // check if the user is authorized to call the function, checking his role
        if (checkRole(req.user, 'patient')) {
            return sendUnauthorizedResponse(res)
        }
        let choiceCtrl = new controllers.ChoiceCtrl();
        try {
            serverResponse = await choiceCtrl.postChoice(req);
            sendPostResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });

    //------------------------------------------------------/api/doctor-------------------------------------------//

    // GET doctor
    app.get('/api/doctor', isLoggedIn, async (req: Request, res: Response) => {
        // check if the user is authorized to call the function, checking his role
        if (checkRole(req.user, 'doctor')) {
            req.query.doctor_ssn = req.user.username
        } else { return sendUnauthorizedResponse(res) }

        let doctorCtrl = new controllers.DoctorCtrl();
        try {
            serverResponse = await doctorCtrl.getDoctor(req);
            sendGetResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });
    // GET doctor's patients
    app.get('/api/doctor/patients', isLoggedIn, async (req: Request, res: Response) => {
        // check if the user is authorized to call the function, checking his role
        if (checkRole(req.user, 'doctor')) {
            req.query.doctor_ssn = req.user.username
        } else { return sendUnauthorizedResponse(res) }

        let doctorCtrl = new controllers.DoctorCtrl();
        try {
            serverResponse = await doctorCtrl.getDoctorPatients(req);
            sendGetResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });

    //------------------------------------------------------/api/message-------------------------------------------//

    // GET message
    app.get('/api/message', isLoggedIn, async (req: Request, res: Response) => {
        let messageCtrl = new controllers.MessageCtrl();
        try {
            serverResponse = await messageCtrl.getMessage(req);
            sendGetResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });
    // POST message
    app.post('/api/message', isLoggedIn, async (req: Request, res: Response) => {
        // check if the user is authorized to call the function, checking his role
        if (checkRole(req.user, 'doctor')) {
            // check if the receiver is a valid receiver for the doctor's message
            let doctorCtrl = new controllers.DoctorCtrl()
            req.query.doctor_ssn = req.user.username
            let doctorPatients = await doctorCtrl.getDoctorPatients(req)
            // if an error occur while retrieving the patients list, return the error
            if (doctorPatients instanceof Error || doctorPatients instanceof CustomError) {
                res.status(500).send({ doctorPatients })
            } else {
                // check if the receiver is in the doctor's patients list
                let valid = false;
                for (let patient of doctorPatients) {
                    if (req.body.receiver == patient.patient_ssn) {
                        valid = true
                    }
                }
                // if the receiver is not in the doctor's patients list, return the error
                if (!valid) { return sendUnauthorizedResponse(res) }
            }
        } else {
            // check if the receiver is patient's doctor
            let patientCtrl = new controllers.PatientCtrl()
            req.query.patient_ssn = req.user.username
            let patient = await patientCtrl.getPatient(req)
            // if an error occur while retrieving the patient, return the error
            if (!(patient instanceof Patient)) {
                res.status(500).send({ patient })
            } else {
                // if the receiver does not correspond to the patient's doctor, return the error
                if (!(req.body.receiver == patient.doctor_ssn)) { return sendUnauthorizedResponse(res) }
            }
        }
        req.body.sender = req.user.username
        let messageCtrl = new controllers.MessageCtrl();
        try {
            serverResponse = await messageCtrl.postMessage(req);
            sendPostResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });
    // DELETE message
    app.delete('/api/message', isLoggedIn, async (req: Request, res: Response) => {
        req.query.receiver = req.user.username
        let messageCtrl = new controllers.MessageCtrl();
        try {
            serverResponse = await messageCtrl.deleteMessage(req);
            sendDeleteResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });
    // GET user's messages
    app.get('/api/messages/user', isLoggedIn, async (req: Request, res: Response) => {
        req.query.receiver = req.user.username
        let messageCtrl = new controllers.MessageCtrl();
        try {
            serverResponse = await messageCtrl.getUserMessages(req);
            sendGetResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });

    //------------------------------------------------------/api/miband-------------------------------------------//
    // GET miband
    app.get('/api/miband', isLoggedIn, async (req: Request, res: Response) => {
        // check if the user is authorized to call the function, checking his role
        if (checkRole(req.user, 'doctor')) {
            // check if the receiver is a valid receiver for the doctor's message
            let doctorCtrl = new controllers.DoctorCtrl()
            req.query.doctor_ssn = req.user.username
            let doctorPatients = await doctorCtrl.getDoctorPatients(req)
            // if an error occur while retrieving the patients list, return the error
            if (doctorPatients instanceof Error || doctorPatients instanceof CustomError) {
                res.status(500).send({ doctorPatients })
            } else {
                // check if the receiver is in the doctor's patients list
                let valid = false;
                for (let patient of doctorPatients) {
                    if (req.query.patient_ssn == patient.patient_ssn) {
                        valid = true
                    }
                }
                // if the receiver is not in the doctor's patients list, return the error
                if (!valid) { return sendUnauthorizedResponse(res) }
            }
        } else {
            req.query.patient_ssn = req.user.username
        }
        let mibandCtrl = new controllers.MibandCtrl();
        try {
            serverResponse = await mibandCtrl.getData(req);
            sendGetResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });
    // POST miband
    app.post('/api/miband', isLoggedIn, async (req: Request, res: Response) => {
        req.query.patient_ssn = req.user.username 
        let mibandCtrl = new controllers.MibandCtrl();
        try {
            serverResponse = await mibandCtrl.postData(req);
            sendPostResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });

    //------------------------------------------------------/api/patient-------------------------------------------//
    // GET patient
    app.get('/api/patient', isLoggedIn, async (req: Request, res: Response) => {
        // check if the user is authorized to call the function, checking his role
        if (checkRole(req.user, 'patient')) {
            req.query.patient_ssn = req.user.username
        } else {
            // check if the parameter has been correctly set
            if (!req.query.patient_ssn) {
                error.name = "PARAMS ERROR"
                error.details = ("important parameter is null")
                res.status(500).send({ ErrorMessage: error })
            }
            // check if the the doctor is authorized to get patient's data
            let doctorCtrl = new controllers.DoctorCtrl()
            req.query.doctor_ssn = req.user.username
            let doctorPatients = await doctorCtrl.getDoctorPatients(req)
            // if an error occur while retrieving the patients list, return the error
            if (doctorPatients instanceof Error || doctorPatients instanceof CustomError) {
                res.status(500).send({ doctorPatients })
            } else {
                // check if the patient is in the doctor's patients list
                let valid = false;
                for (let patient of doctorPatients) {
                    if (req.query.patient_ssn == patient.patient_ssn) {
                        valid = true
                    }
                }
                // if the receiver is not in the doctor's patients list, return the error
                if (!valid) { return sendUnauthorizedResponse(res) }
            }
        }
        let patientCtrl = new controllers.PatientCtrl();
        try {
            serverResponse = await patientCtrl.getPatient(req);
            sendGetResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });
    // GET patient's doctor
    app.get('/api/patient/doctor', isLoggedIn, async (req: Request, res: Response) => {
        // check if the user is authorized to call the function, checking his role
        if (checkRole(req.user, 'patient')) {
            req.query.patient_ssn = req.user.username
        } else { return sendUnauthorizedResponse(res) }

        let patientCtrl = new controllers.PatientCtrl();
        try {
            serverResponse = await patientCtrl.getPatientDoctor(req);
            sendGetResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });
    //------------------------------------------------------/api/patient_survey-------------------------------------------//
    // GET patient's survey
    app.get('/api/patient_survey', isLoggedIn, async (req: Request, res: Response) => {
        // check if the user is authorized to call the function, checking his role
        if (checkRole(req.user, 'patient')) {
            req.query.patient_ssn = req.user.username
        } else {
            // check if the parameter has been correctly set
            if (!req.query.patient_ssn) {
                error.name = "PARAMS ERROR"
                error.details = ("important parameter is null")
                res.status(500).send({ ErrorMessage: error })
            }
            // check if the the doctor is authorized to get patient's data
            let doctorCtrl = new controllers.DoctorCtrl()
            req.query.doctor_ssn = req.user.username
            let doctorPatients = await doctorCtrl.getDoctorPatients(req)
            // if an error occur while retrieving the patients list, return the error
            if (doctorPatients instanceof Error || doctorPatients instanceof CustomError) {
                res.status(500).send({ doctorPatients })
            } else {
                // check if the patient is in the doctor's patients list
                let valid = false;
                for (let patient of doctorPatients) {
                    if (req.query.patient_ssn == patient.patient_ssn) {
                        valid = true
                    }
                }
                // if the receiver is not in the doctor's patients list, return the error
                if (!valid) { return sendUnauthorizedResponse(res) }
            }
        }
        let patientSurveyCtrl = new controllers.PatientSurveyCtrl();
        try {
            serverResponse = await patientSurveyCtrl.getPatientSurvey(req);
            sendGetResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });
    // POST patient's survey
    app.post('/api/patient_survey', isLoggedIn, async (req: Request, res: Response) => {
        req.query.patient_ssn = req.user.username
        let patientSurveyCtrl = new controllers.PatientSurveyCtrl();
        try {
            serverResponse = await patientSurveyCtrl.postPatientSurvey(req);
            sendPostResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });
    // GET all the patient's surveys
    app.get('/api/patient_survey/all', isLoggedIn, async (req: Request, res: Response) => {
        req.query.patient_ssn = req.user.username
        let patientSurveyCtrl = new controllers.PatientSurveyCtrl();
        try {
            serverResponse = await patientSurveyCtrl.getPatientSurveys(req);
            sendGetResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500);
            res.send(err);
        }
    });
    //------------------------------------------------------/api/question-------------------------------------------//
    // GET question
    app.get('/api/question', isLoggedIn, async (req: Request, res: Response) => {
        let questionCtrl = new controllers.QuestionCtrl();
        try {
            serverResponse = await questionCtrl.getQuestion(req);
            sendGetResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500);
            res.send(err);
        }
    });
    // POST question
    app.post('/api/question', isLoggedIn, async (req: Request, res: Response) => {
        // check if the user is authorized to call the function, checking his role
        if (checkRole(req.user, 'patient')) {
            return sendUnauthorizedResponse(res)
        }
        let questionCtrl = new controllers.QuestionCtrl();
        try {
            serverResponse = await questionCtrl.postQuestion(req);
            sendPostResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });
    //------------------------------------------------------/api/survey-------------------------------------------//
    // GET survey
    app.get('/api/survey', isLoggedIn, async (req: Request, res: Response) => {
        let surveyCtrl = new controllers.SurveyCtrl();
        try {
            serverResponse = await surveyCtrl.getSurvey(req);
            sendGetResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });
    // POST Survey
    app.post('/api/survey', isLoggedIn, async (req: Request, res: Response) => {
        // check if the user is authorized to call the function, checking his role
        if (checkRole(req.user, 'patient')) {
            return sendUnauthorizedResponse(res)
        }
        let surveyCtrl = new controllers.SurveyCtrl();
        try {
            serverResponse = await surveyCtrl.postSurvey(req);
            sendPostResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });

    //------------------------------------------------------/api/user-------------------------------------------//
    // GET user
    app.get('/api/user', async (req: Request, res: Response) => {
        // check if the user is authorized to call the function, checking his role
        if (checkRole(req.user, 'patient')) {
            return sendUnauthorizedResponse(res)
        }
        let userCtrl = new controllers.UserCtrl();
        try {
            serverResponse = await userCtrl.getUser(req);
            sendGetResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });
    // POST user
    app.post('/api/user', async (req: Request, res: Response) => {
        let userCtrl = new controllers.UserCtrl();
        try {
            serverResponse = await userCtrl.postUser(req);
            sendPostResponse(res, serverResponse);
        }
        catch (err) {
            res.status(500)
                .send(err);
        }
    });
};

// ==========================================================================================================================================================
// ==============================================  CHECK-LOGIN FUNCTIONS  ===================================================================================
// ==========================================================================================================================================================

// routes middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    // if not authenticated, return error message
    if (!(req.isAuthenticated())) {
        return res.status(401)
            .send({ ErrorMessage: 'You need to be logged in to call this function' });
    }
    // check-in passed
    return next()
}

// routes middleware to check user is logged in
function loginRedirect(req, res, next) {
    // if authenticated, return error message
    if (req.isAuthenticated()) {
        return res.status(401)
            .send({ ServerResponse: 'You are already logged in' });
    }
    // check-in passed
    return next();
}

// check if user is authorized to do something by checking the role
function checkRole(user: SerializedUser, validRole: string) {
    return (user.role == validRole)
}
