async function fetchUserData() {
    try {
        const response = await fetch('/api/users');
        const data = await response.json();
        const userDataDiv = document.getElementById('user-data').querySelector('tbody');

        data.forEach(user => {
            const userRow = document.createElement('tr');
            userRow.innerHTML = `
                <td>${user._id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.password}</td>
            `;
            userDataDiv.appendChild(userRow);
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// Fetch user data when the page loads
window.onload = fetchUserData;