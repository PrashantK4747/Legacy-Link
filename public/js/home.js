// Function to open and close the profile sidebar
function openProfileSidebar() {
    document.getElementById('profileSidebar').style.right = '0';
}
function closeProfileSidebar() {
    document.getElementById('profileSidebar').style.right = '-300px';
}

// Function to toggle the sidebar menu
function toggleMenu() {
    const menuBar = document.getElementById('menuBar');
    if (menuBar.style.left === '0px') {
        menuBar.style.left = '-250px';
    } else {
        menuBar.style.left = '0';
    }
}

// Function to toggle the post creation form
function togglePostForm() {
    const postFormSection = document.getElementById("postCreationSection");
    if (postFormSection.style.display === "none" || postFormSection.style.display === "") {
        postFormSection.style.display = "block";
    } else {
        postFormSection.style.display = "none";
    }
}

// Close sidebars when clicked anywhere else
document.addEventListener('click', function(event) {
    const profileSidebar = document.getElementById('profileSidebar');
    const menuBar = document.getElementById('menuBar');
    const profilePic = document.querySelector('.profile-pic');
    const menuBtn = document.querySelector('.menu-btn');

    // Close profile sidebar if clicked outside
    if (!profileSidebar.contains(event.target) && event.target !== profilePic) {
        closeProfileSidebar();
    }

    // Close menu sidebar if clicked outside
    if (!menuBar.contains(event.target) && event.target !== menuBtn) {
        menuBar.style.left = '-250px';
    }
});

document.addEventListener("DOMContentLoaded", () => {
  // Initialize all comments containers to be collapsed
  document.querySelectorAll(".comments-container").forEach((commentsContainer) => {
    commentsContainer.style.maxHeight = "0px";
    commentsContainer.style.padding = "0";
  });

  // Toggle comments container visibility
  document.querySelectorAll(".view-comments-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const commentsContainer = button.nextElementSibling;

      if (commentsContainer.style.maxHeight === "0px" || !commentsContainer.style.maxHeight) {
        // Expand the comments container
        commentsContainer.style.maxHeight = commentsContainer.scrollHeight + "px";
        commentsContainer.style.padding = "10px";
        button.textContent = `Hide Comments (${commentsContainer.querySelectorAll(".comment").length})`;
      } else {
        // Collapse the comments container
        commentsContainer.style.maxHeight = "0";
        commentsContainer.style.padding = "0";
        button.textContent = `View Comments (${commentsContainer.querySelectorAll(".comment").length})`;
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Event delegation for delete post buttons
  document.querySelectorAll(".delete-post-button").forEach((button) => {
    button.addEventListener("click", async (e) => {
      e.preventDefault(); // Prevent default behavior
      const postId = button.getAttribute("data-post-id");

      try {
        const response = await fetch(`/delete_post/${postId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Remove the post from the DOM
          const postElement = document.querySelector(`.post-card[data-post-id="${postId}"]`);
          if (postElement) {
            postElement.remove();
          }
        } else {
          console.error("Failed to delete post.");
        }
      } catch (err) {
        console.error("Error:", err);
      }
    });
  });
});

// Function to toggle the visibility of the comments section
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all comments containers to be collapsed
  document.querySelectorAll(".comments-container").forEach((commentsContainer) => {
    commentsContainer.style.maxHeight = "0px";
    commentsContainer.style.padding = "0";
  });

  // Toggle comments container visibility
  document.querySelectorAll(".view-comments-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const commentsContainer = button.nextElementSibling;

      if (commentsContainer.style.maxHeight === "0px") {
        // Expand the comments container
        commentsContainer.style.maxHeight = commentsContainer.scrollHeight + "px";
        commentsContainer.style.padding = "10px";
        button.textContent = "Comments";
      } else {
        // Collapse the comments container
        commentsContainer.style.maxHeight = "0px"; // Explicitly set to "0px"
        commentsContainer.style.padding = "0";
        button.textContent = "Comments";
      }
    });
  });
});

// AJAX for Like Button
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".like-form").forEach((form) => {
        form.addEventListener("submit", async (e) => {
            e.preventDefault(); // Prevent page refresh
            const postId = form.getAttribute("data-post-id");

            try {
                const response = await fetch(`/like_post/${postId}`, {
                    method: "POST",
                });

                if (response.ok) {
                    // Reload only the like count and button text
                    const button = form.querySelector(".like-button");
                    const result = await response.json();
                    button.innerHTML = `${result.userLiked ? "Unlike" : "Like"} (${result.likeCount})`;
                } else {
                    console.error("Failed to like/unlike the post.");
                }
            } catch (err) {
                console.error("Error:", err);
            }
        });
    });

    // AJAX for Comment Form
    document.addEventListener("DOMContentLoaded", () => {
        // AJAX for Comment Form
        document.querySelectorAll(".comment-form").forEach((form) => {
          form.addEventListener("submit", async (e) => {
            e.preventDefault(); // Prevent page refresh
            const postId = form.getAttribute("data-post-id");
            const commentInput = form.querySelector("textarea");
      
            // Validate the comment input
            if (!commentInput.value.trim()) {
              alert("Comment cannot be empty!");
              return;
            }
      
            try {
              const response = await fetch(`/comment_post/${postId}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ comment: commentInput.value.trim() }),
              });
      
              if (response.ok) {
                // Append the new comment to the comments section
                const commentsContainer = form.previousElementSibling;
                const result = await response.json();
                const newComment = document.createElement("div");
                newComment.classList.add("comment");
                newComment.innerHTML = `<p><strong>${result.authorName}:</strong> ${result.comment}</p>`;
                commentsContainer.appendChild(newComment);
      
                // Clear the comment input
                commentInput.value = "";
              } else {
                console.error("Failed to add comment.");
              }
            } catch (err) {
              console.error("Error:", err);
            }
          });
        });
      });

      document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".delete-comment-button").forEach((button) => {
          button.addEventListener("click", async (e) => {
            e.preventDefault();
            const commentId = button.getAttribute("data-comment-id");
      
            try {
              const response = await fetch(`/delete_comment/${commentId}`, {
                method: "POST",
              });
      
              if (response.ok) {
                const commentElement = document.querySelector(`.comment[data-comment-id="${commentId}"]`);
                if (commentElement) {
                  commentElement.remove();
                }
              } else {
                console.error("Failed to delete comment.");
              }
            } catch (err) {
              console.error("Error:", err);
            }
          });
        });
      });
    });