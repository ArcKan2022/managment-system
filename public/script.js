document.addEventListener("DOMContentLoaded", function () {
    // ===========================
    // Login Form Handling
    // ===========================
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("http://localhost:3000/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });
                if (response.ok) {
                    const result = await response.json();
                    alert("Login successful!");
                    window.location.href = result.role === "admin" ? "admin_dashboard.html" : "user_dashboard.html";
                } else {
                    alert("Invalid credentials!");
                }
            } catch (error) {
                console.error("Error during login:", error);
                alert("Server error. Please try again later.");
            }
        });
    }

    // ===========================
    // Fetch and Display Uploaded Files
    // ===========================
    if (document.getElementById("fileList")) {
        fetch("http://localhost:3000/files")
            .then(response => response.json())
            .then(files => {
                const fileList = document.getElementById("fileList");
                fileList.innerHTML = ""; // Clear previous list
                files.forEach(file => {
                    const listItem = document.createElement("li");
                    listItem.innerHTML = `<a href="uploads/${file}" target="_blank">${file}</a>`;
                    fileList.appendChild(listItem);
                });
            })
            .catch(error => console.error("Error fetching files:", error));
    }

    // ===========================
    // Handle Folder Upload
    // ===========================
    if (document.getElementById("uploadForm")) {
        document.getElementById("fileInput").setAttribute("webkitdirectory", "");
        document.getElementById("fileInput").setAttribute("directory", "");
        document.getElementById("uploadForm").addEventListener("submit", async (event) => {
            event.preventDefault();
            const files = document.getElementById("fileInput").files;
            if (files.length === 0) {
                alert("Please select a folder.");
                return;
            }
            const formData = new FormData();
            for (const file of files) {
                formData.append("files", file, file.webkitRelativePath);
            }
            try {
                const response = await fetch("http://localhost:3000/upload-folder", {
                    method: "POST",
                    body: formData
                });
                const result = await response.json();
                alert(result.message);
                location.reload();
            } catch (error) {
                console.error("Error uploading folder:", error);
                alert("Folder upload failed. Try again.");
            }
        });
    }

    // ===========================
    // Add Personnel to Table (with localStorage)
    // ===========================
    const personnelForm = document.getElementById("addPersonnelForm");
    const tableBody = document.querySelector("#personnelTable tbody");
    let students = JSON.parse(localStorage.getItem("students")) || [];

    // Function to render table
    function renderTable() {
        tableBody.innerHTML = ""; // Clear previous table rows
        students.forEach((student, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.sno}</td>
                <td>${student.name}</td>
                <td>${student.platoon}</td>
                <td>${student.course}</td>
                <td>${student.grade}</td>
                <td>
                    <button class="edit-btn" data-index="${index}">Edit</button>
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Initial rendering from localStorage
    renderTable();

    // Save to localStorage
    function saveToLocalStorage() {
        localStorage.setItem("students", JSON.stringify(students));
    }

    // Add new personnel
    if (personnelForm) {
        personnelForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const sno = document.getElementById("sno").value;
            const name = document.getElementById("name").value;
            const platoon = document.getElementById("platoon").value;
            const course = document.getElementById("course").value;
            const grade = document.getElementById("grade").value;

            if (sno && name && platoon && course && grade) {
                students.push({ sno, name, platoon, course, grade });
                saveToLocalStorage(); // Save to localStorage
                renderTable(); // Refresh table
                personnelForm.reset(); // Clear form
            } else {
                alert("Please fill out all fields.");
            }
        });
    }

    // ===========================
    // Edit/Delete Personnel Entry
    // ===========================
    tableBody.addEventListener("click", (event) => {
        const index = event.target.getAttribute("data-index");

        // DELETE ENTRY
        if (event.target.classList.contains("delete-btn")) {
            students.splice(index, 1);
            saveToLocalStorage();
            renderTable();
        }

        // EDIT ENTRY
        if (event.target.classList.contains("edit-btn")) {
            const student = students[index];
            document.getElementById("sno").value = student.sno;
            document.getElementById("name").value = student.name;
            document.getElementById("platoon").value = student.platoon;
            document.getElementById("course").value = student.course;
            document.getElementById("grade").value = student.grade;

            // Remove the existing entry so that it can be replaced
            students.splice(index, 1);
            saveToLocalStorage();
            renderTable();
        }
    });
});
