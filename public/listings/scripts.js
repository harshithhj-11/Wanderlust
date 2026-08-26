const deleteForm = document.querySelector(".delete-form");

deleteForm.addEventListener("submit", (event) => {
    const answer = confirm(
        "Are you sure you want to delete this listing?"
    );

    if (!answer) {
        event.preventDefault();
    }
});