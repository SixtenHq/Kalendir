const sessionData = 
{
    id: null,
    cal: null,
    CalSorces: [],
    savedCourses: {
        // code:
        //      name: 
        //      customName: 
        },
            
};

export function exportData() {
    return JSON.stringify(sessionData);
}

//-----
export function getId() {
    return sessionData.id;
}

export function setId(newId) {
    sessionData.id = newId;
}
//-----
export function getCal() {
    return sessionData.cal;
}

export function setCal(newCal) {
    sessionData.cal = newCal;
}
//-----
export function getCalSorces() {
    return sessionData.CalSorces;
}

export function addCalSorce(source) {
    sessionData.CalSorces.push(source);
}

export function CalSorcesIncludes(source) {
    return sessionData.CalSorces.includes(source);
}
//-----
export function gettSavedCourses() {
    return sessionData.savedCourses;
}

export function gettSavedCourse(courseCode) {
    return sessionData.savedCourses[courseCode];
}

export function addSavedCourse(courseCode, name) {
    sessionData.savedCourses[courseCode] = {
        name: name
    };
}
//-----