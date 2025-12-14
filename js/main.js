// שליפת שדה החיפוש מה-HTML
const searchInput = document.getElementById('searchInput');

// שליפת כל הכרטיסיות לצורך סינון
const cards = document.querySelectorAll('.content-unit');

// שליפת הודעה שתוצג כאשר אין תוצאות חיפוש
const noResults = document.getElementById('noResultsMessage');

// משתנה גלובלי המציין האם קיים חיבור פעיל ל-LMS
let isScormConnected = false;

// פתיחת חיבור ל-LMS בעת טעינת העמוד
document.addEventListener('DOMContentLoaded', function () {

    // בדיקה שספריית pipwerks קיימת ונטענה
    if (!window.pipwerks || !pipwerks.SCORM) {
        console.warn('[SCORM] Wrapper not found.');
        return;
    }

    // ניסיון לפתיחת חיבור ל-LMS
    isScormConnected = pipwerks.SCORM.init();

    if (!isScormConnected) {
        console.error('[SCORM] init() failed.');
    }
});


// בדיקה שהשדה קיים לפני הוספת מאזין 
if (searchInput) {

    // האזנה להקלדה בשדה החיפוש
    searchInput.addEventListener('keyup', function (event) {

        // המרת הטקסט שהוקלד לאותיות קטנות לצורך השוואה
        const searchText = event.target.value.toLowerCase();
        let visibleCount = 0;

        // מעבר על כל הכרטיסיות
        cards.forEach(function (cardWrapper) {

            // שליפת כותרת הכרטיסיה
            const title = cardWrapper.querySelector('.card-title').innerText.toLowerCase();

            // שליפת תיאור הכרטיסיה
            const description = cardWrapper.querySelector('p').innerText.toLowerCase();

            // בדיקה אם הטקסט שהוקלד מופיע בכותרת או בתיאור
            if (title.includes(searchText) || description.includes(searchText)) {
                cardWrapper.style.display = '';
                visibleCount++;
            } else {
                cardWrapper.style.display = 'none';
            }
        });

        // הצגת הודעה אם אין כרטיסיות תואמים
        if (visibleCount === 0) {
            noResults.style.display = "block";
        } else {
            noResults.style.display = "none";
        }
    });
}





// פונקציה לבדיקת תקינות הטופס לפני שליחה
function validateForm(event) {

    // מניעת שליחה אוטומטית של הטופס
    event.preventDefault();

    let valid = true;

    // שליפת שדות הטופס
    const name = document.getElementById("studentName");
    const motivation = document.getElementById("motivation");

    // הסתרת כל הודעות השגיאה הקיימות
    document.querySelectorAll(".error-message").forEach(e => e.style.display = "none");

    // הסרת סימון שגיאה משדות הטופס
    document.querySelectorAll(".form-control, .form-select").forEach(i => i.classList.remove("error"));

    // בדיקה אם שדה השם ריק
    if (name.value.trim() === "") {
        name.classList.add("error");
        name.nextElementSibling.style.display = "block";
        valid = false;
    }

    // בדיקה אם שדה המוטיבציה ריק
    if (motivation.value.trim() === "") {
        motivation.classList.add("error");
        motivation.nextElementSibling.style.display = "block";
        valid = false;
    }

    // אם נמצאה שגיאה – הפסקת התהליך
    if (!valid) return;

    // אם הכול תקין – שליחה ל-LMS
    submitToLMS();
}


// פונקציה לשליחת נתוני הטופס ל-LMS באמצעות SCORM
function submitToLMS() {

    // שליפת ערכי הטופס
    const name = document.getElementById('studentName').value;
    const grade = document.getElementById('interestLevel').value;
    const motivation = document.getElementById('motivation').value;

    // שימוש באובייקט ה-SCORM של pipwerks
    const scorm = pipwerks.SCORM;

    // בדיקה האם קיים חיבור פעיל ל-LMS
    if (isScormConnected) {

        // יצירת מחרוזת נתונים לשמירה במערכת
        const dataString = "Name: " + name + ", Grade: " + grade + ", Motivation: " + motivation;

        // שמירת הנתונים ב-LMS
        scorm.set("cmi.suspend_data", dataString);

        // עדכון סטטוס השלמת הלמידה
        scorm.set("cmi.core.lesson_status", "completed");

        // שמירת הנתונים במערכת
        scorm.save();

        // הצגת הודעת הצלחה למשתמש
        showToast("Form submitted successfully!");

        // איפוס הטופס לאחר שליחה
        document.getElementById("lmsForm").reset();

    } else {

        // טיפול במקרה שבו אין חיבור פעיל ל-LMS
        console.error("LMS Connection failed");
        showToast("Error submitting the form. Please try again.", true);
    }
}



// פונקציה להצגת הודעת חיווי (Toast) למשתמש
function showToast(message, isError = false) {

    // שליפת אלמנט ההודעה
    const toast = document.getElementById("formFeedback");

    // הסרת עיצוב שגיאה קודם
    toast.classList.remove("error-toast");

    // הצגת הטקסט
    toast.innerText = message;

    // הוספת עיצוב שגיאה במידת הצורך
    if (isError) {
        toast.classList.add("error-toast");
    }

    // הצגת ההודעה
    toast.classList.add("show");

    // הסתרת ההודעה לאחר מספר שניות
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3500);
}

// שמירה וניתוק החיבור ל-LMS בעת יציאה מהעמוד
window.addEventListener('beforeunload', function () {
    if (isScormConnected) {
        pipwerks.SCORM.save();
        pipwerks.SCORM.quit();
    }
});
