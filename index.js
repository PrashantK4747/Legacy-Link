import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import session from "express-session";
import dotenv from "dotenv";
import chatbotRouter from './public/js/chatbot.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.use('/', chatbotRouter);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// PostgreSQL database connection
const db = new pg.Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  ssl: {
    require: true,
    rejectUnauthorized: false
  },
  // Add these options to fix IPv6 issues
  connectionTimeoutMillis: 5000,
  max: 20,
  // Force IPv4
  family: 4
});

db.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => {
  res.render("mainpage.ejs", { error: null });
});
app.get("/alumni_login", (req, res) => {
  res.render("alumni_login.ejs", { error: null });
});

app.get("/student_login", (req, res) => {
  res.render("student_login.ejs", { error: null });
});

app.get("/admin_login", (req, res) => {
  res.render("admin_login.ejs", { error: null });
});

// Add this route after your other route definitions

app.get("/home", async (req, res) => {
  const user = req.session.user || req.session.alumni;
  
  if (!user) {
    return res.redirect("/");
  }

  try {
    // Fix the table name (alumni instead of alumnis)
    const userResult = await db.query(
      `SELECT * FROM ${user.type === 'alumni' ? 'alumni' : 'students'} WHERE prn = $1`,
      [user.prn]
    );

    // Fetch posts with like and comment counts
    const postsResult = await db.query(`
      SELECT 
        posts.*,
        COUNT(DISTINCT likes.id) AS like_count,
        COUNT(DISTINCT comments.id) AS comment_count,
        EXISTS (
          SELECT 1 FROM likes WHERE likes.post_id = posts.id AND likes.user_prn = $1
        ) AS user_liked
      FROM posts
      LEFT JOIN likes ON posts.id = likes.post_id
      LEFT JOIN comments ON posts.id = comments.post_id
      GROUP BY posts.id
      ORDER BY posts.created_at DESC
    `, [user.prn]);

    // Fetch comments
    const commentsResult = await db.query(`
      SELECT comments.*, students.name AS student_name, alumni.name AS alumni_name 
      FROM comments
      LEFT JOIN students ON comments.user_prn = students.prn
      LEFT JOIN alumni ON comments.user_prn = alumni.prn
      ORDER BY comments.created_at ASC
    `);

    // Fetch events with registration status
const eventsResult = await db.query(`
  SELECT 
      events.*,
      COUNT(DISTINCT event_registrations.id) as registration_count,
      EXISTS (
          SELECT 1 FROM event_registrations 
          WHERE event_registrations.event_id = events.id 
          AND event_registrations.user_prn = $1
      ) as user_registered,
      COALESCE(s.name, a.name) as creator_name,
      COALESCE(s.batch_year, a.batch_year) as creator_batch_year
  FROM events
  LEFT JOIN event_registrations ON events.id = event_registrations.event_id
  LEFT JOIN students s ON events.organizer_prn = s.prn AND events.organizer_type = 'student'
  LEFT JOIN alumni a ON events.organizer_prn = a.prn AND events.organizer_type = 'alumni'
  GROUP BY events.id, s.name, a.name, s.batch_year, a.batch_year
  ORDER BY events.event_date ASC
`, [user.prn]);

    // Render the home page with all necessary data
    res.render("home", {
      user: userResult.rows[0],
      posts: postsResult.rows,
      comments: commentsResult.rows,
      events: eventsResult.rows
    });

  } catch (err) {
    console.error("Error in /home route:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Student home route
app.get("/student_home", async (req, res) => {
  if (req.session.user) {
    try {
      const studentResult = await db.query(`SELECT * FROM students WHERE prn = $1`, [req.session.user.prn]);
      const postsResult = await db.query(`
        SELECT 
          posts.*, 
          COUNT(DISTINCT likes.id) AS like_count, 
          COUNT(DISTINCT comments.id) AS comment_count,
          EXISTS (
            SELECT 1 FROM likes WHERE likes.post_id = posts.id AND likes.user_prn = $1
          ) AS user_liked
        FROM posts
        LEFT JOIN likes ON posts.id = likes.post_id
        LEFT JOIN comments ON posts.id = comments.post_id
        GROUP BY posts.id
        ORDER BY posts.created_at DESC
      `, [req.session.user.prn]);

      const commentsResult = await db.query(`
        SELECT comments.*, students.name AS student_name, alumni.name AS alumni_name 
        FROM comments
        LEFT JOIN students ON comments.user_prn = students.prn
        LEFT JOIN alumni ON comments.user_prn = alumni.prn
        ORDER BY comments.created_at ASC
      `);

      // Add this query to fetch events
      const eventsResult = await db.query(`
        SELECT 
            events.*,
            COUNT(DISTINCT event_registrations.id) as registration_count,
            EXISTS (
                SELECT 1 FROM event_registrations 
                WHERE event_registrations.event_id = events.id 
                AND event_registrations.user_prn = $1
            ) as user_registered,
            COALESCE(s.name, a.name) as creator_name,
            COALESCE(s.batch_year, a.batch_year) as creator_batch_year
        FROM events
        LEFT JOIN event_registrations ON events.id = event_registrations.event_id
        LEFT JOIN students s ON events.organizer_prn = s.prn AND events.organizer_type = 'student'
        LEFT JOIN alumni a ON events.organizer_prn = a.prn AND events.organizer_type = 'alumni'
        GROUP BY events.id, s.name, a.name, s.batch_year, a.batch_year
        ORDER BY events.event_date ASC
    `, [req.session.user.prn]); 

      if (studentResult.rows.length > 0) {
        res.render("home.ejs", {
          user: studentResult.rows[0],
          posts: postsResult.rows,
          comments: commentsResult.rows,
          events: eventsResult.rows  // Add this line
        });
      } else {
        res.redirect("/student_login");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect("/student_login");
  }
});

// Modified alumni home route
app.get("/alumni_home", async (req, res) => {
  if (req.session.alumni) {
    try {
      const alumniResult = await db.query(`SELECT * FROM alumni WHERE prn = $1`, [req.session.alumni.prn]);
      const postsResult = await db.query(`
        SELECT 
          posts.*, 
          COUNT(DISTINCT likes.id) AS like_count, 
          COUNT(DISTINCT comments.id) AS comment_count,
          EXISTS (
            SELECT 1 FROM likes WHERE likes.post_id = posts.id AND likes.user_prn = $1
          ) AS user_liked
        FROM posts
        LEFT JOIN likes ON posts.id = likes.post_id
        LEFT JOIN comments ON posts.id = comments.post_id
        GROUP BY posts.id
        ORDER BY posts.created_at DESC
      `, [req.session.alumni.prn]);

      const commentsResult = await db.query(`
        SELECT comments.*, students.name AS student_name, alumni.name AS alumni_name 
        FROM comments
        LEFT JOIN students ON comments.user_prn = students.prn
        LEFT JOIN alumni ON comments.user_prn = alumni.prn
        ORDER BY comments.created_at ASC
      `);

      // Add this query to fetch events
      const eventsResult = await db.query(`
        SELECT 
            events.*,
            COUNT(DISTINCT event_registrations.id) as registration_count,
            EXISTS (
                SELECT 1 FROM event_registrations 
                WHERE event_registrations.event_id = events.id 
                AND event_registrations.user_prn = $1
            ) as user_registered,
            COALESCE(s.name, a.name) as creator_name,
            COALESCE(s.batch_year, a.batch_year) as creator_batch_year
        FROM events
        LEFT JOIN event_registrations ON events.id = event_registrations.event_id
        LEFT JOIN students s ON events.organizer_prn = s.prn AND events.organizer_type = 'student'
        LEFT JOIN alumni a ON events.organizer_prn = a.prn AND events.organizer_type = 'alumni'
        GROUP BY events.id, s.name, a.name, s.batch_year, a.batch_year
        ORDER BY events.event_date ASC
    `, [req.session.alumni.prn]); 

      if (alumniResult.rows.length > 0) {
        res.render("home.ejs", {
          user: alumniResult.rows[0],
          posts: postsResult.rows,
          comments: commentsResult.rows,
          events: eventsResult.rows  // Add this line
        });
      } else {
        res.redirect("/alumni_login");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect("/alumni_login");
  }
});

// Event registration route
app.post("/event/:id/register", async (req, res) => {
  const eventId = req.params.id;
  const user = req.session.user || req.session.alumni;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await db.query(
      "INSERT INTO event_registrations (event_id, user_prn, user_type, registered_at) VALUES ($1, $2, $3, NOW())",
      [eventId, user.prn, user.type]
    );

    // Get updated registration count
    const countResult = await db.query(
      "SELECT COUNT(*) as count FROM event_registrations WHERE event_id = $1",
      [eventId]
    );

    res.json({ 
      success: true, 
      registration_count: countResult.rows[0].count 
    });
  } catch (err) {
    console.error("Error registering for event:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Event unregistration route
app.post("/event/:id/unregister", async (req, res) => {
  const eventId = req.params.id;
  const user = req.session.user || req.session.alumni;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await db.query(
      "DELETE FROM event_registrations WHERE event_id = $1 AND user_prn = $2",
      [eventId, user.prn]
    );

    // Get updated registration count
    const countResult = await db.query(
      "SELECT COUNT(*) as count FROM event_registrations WHERE event_id = $1",
      [eventId]
    );

    res.json({ 
      success: true, 
      registration_count: countResult.rows[0].count 
    });
  } catch (err) {
    console.error("Error unregistering from event:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add after other routes and before app.listen

// Create event route
app.post("/create_event", async (req, res) => {
  const { title, description, event_date, location } = req.body;
  const user = req.session.user || req.session.alumni;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Insert the new event into the database
    await db.query(
      `INSERT INTO events (
        title, 
        description, 
        event_date, 
        location, 
        organizer_prn, 
        organizer_type,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        title,
        description,
        event_date,
        location,
        user.prn,
        user.type
      ]
    );

    // Redirect back to the appropriate home page
    const redirectPath = user.type === 'student' ? '/student_home' : '/alumni_home';
    res.redirect(redirectPath);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete event route
app.delete("/event/:id", async (req, res) => {
  const eventId = req.params.id;
  const user = req.session.user || req.session.alumni;

  if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
  }

  try {
      // First check if user is authorized to delete this event
      const eventCheck = await db.query(
          "SELECT * FROM events WHERE id = $1 AND organizer_prn = $2",
          [eventId, user.prn]
      );

      if (eventCheck.rows.length === 0) {
          return res.status(403).json({ error: "You are not authorized to delete this event" });
      }

      // Delete all registrations first (due to foreign key constraints)
      await db.query(
          "DELETE FROM event_registrations WHERE event_id = $1",
          [eventId]
      );

      // Then delete the event
      await db.query(
          "DELETE FROM events WHERE id = $1",
          [eventId]
      );

      res.json({ success: true });
  } catch (err) {
      console.error("Error deleting event:", err);
      res.status(500).json({ error: "Internal server error" });
  }
});

// Admin home route
app.get("/admin_home", async (req, res) => {
  if (req.session.admin) {
    try {
      // Fetch admin details
      const adminResult = await db.query(`SELECT * FROM admin WHERE username = $1`, [req.session.admin.username]);

      // Fetch counts for alumni, students, and posts
      const alumniCountResult = await db.query("SELECT COUNT(*) AS count FROM alumni");
      const studentCountResult = await db.query("SELECT COUNT(*) AS count FROM students");
      const postCountResult = await db.query("SELECT COUNT(*) AS count FROM posts");

      // Extract counts
      const alumniCount = alumniCountResult.rows[0].count;
      const studentCount = studentCountResult.rows[0].count;
      const postCount = postCountResult.rows[0].count;

      // Fetch recent posts
      const postsResult = await db.query("SELECT * FROM posts ORDER BY created_at DESC LIMIT 10");

      if (adminResult.rows.length > 0) {
        // Render the admin dashboard with all the data
        res.render("admin/admin_home.ejs", {
          user: adminResult.rows[0],
          alumniCount,
          studentCount,
          postCount,
          posts: postsResult.rows,
        });
      } else {
        res.redirect("/admin_login");
      }
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect("/admin_login");
  }
});

// Student login
app.post("/student_login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM students WHERE prn = $1 AND password = $2", [username, password]);

    if (result.rows.length > 0) {
      req.session.user = {
        prn: username,
        name: result.rows[0].name,
        batch_year: result.rows[0].batch_year,
        type: "student",
      };
      res.redirect("/student_home");
    } else {
      res.render("student_login.ejs", { error: "Invalid PRN or password." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Alumni login
app.post("/alumni_login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM alumni WHERE prn = $1 AND password = $2", [username, password]);

    if (result.rows.length > 0) {
      req.session.alumni = {
        prn: username,
        name: result.rows[0].name,
        batch_year: result.rows[0].batch_year,
        type: "alumni",
      };
      res.redirect("/alumni_home");
    } else {
      res.render("alumni_login.ejs", { error: "Invalid PRN or password." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Admin login
app.post("/admin_login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM admin WHERE username = $1 AND password = $2", [username, password]);

    if (result.rows.length > 0) {
      req.session.admin = {
        username: username,
        name: result.rows[0].name || username, // Use name or fallback to username
        type: "admin",
      };
      res.redirect("/admin_home");
    } else {
      res.render("admin_login.ejs", { error: "Invalid username or password." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to create a new post
app.post("/create_post", async (req, res) => {
  const { title, content } = req.body;
  const user = req.session.user || req.session.alumni || req.session.admin; // Check for logged-in user

  if (!user) {
    return res.redirect("/login"); // Redirect to login if the user is not logged in
  }

  try {
    // Determine author_name and other fields
    const authorName = user.name || user.username || "Unknown Author";
    let userType;
    let redirectPath;

    if (req.session.user) {
      userType = "student";
      redirectPath = "/student_home";
    } else if (req.session.alumni) {
      userType = "alumni";
      redirectPath = "/alumni_home";
    } else if (req.session.admin) {
      userType = "admin";
      redirectPath = "/admin_home";
    } else {
      userType = "unknown"; // Fallback value (should not happen)
      redirectPath = "/login";
    }

    const userPrn = user.prn || user.username;
    const batchYear = user.batch_year || 0;

    // Insert the new post into the database
    await db.query(
      `INSERT INTO posts (user_prn, user_type, author_name, batch_year, title, content, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [userPrn, userType, authorName, batchYear, title, content]
    );

    // Redirect to the appropriate home page
    res.redirect(redirectPath);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to delete a post
app.delete('/delete_post/:id', async (req, res) => {
  try {
      const postId = parseInt(req.params.id);
      const user = req.session.user || req.session.alumni;

      // Validate postId
      if (!postId || isNaN(postId)) {
          return res.status(400).json({ 
              success: false, 
              error: 'Invalid post ID' 
          });
      }

      // Validate user session
      if (!user) {
          return res.status(401).json({ 
              success: false, 
              error: 'Not authorized' 
          });
      }

      // Check if post exists and belongs to user
      const postCheck = await db.query(
          'SELECT * FROM posts WHERE id = $1 AND user_prn = $2',
          [postId, user.prn]
      );

      if (postCheck.rows.length === 0) {
          return res.status(403).json({ 
              success: false, 
              error: 'Not authorized to delete this post' 
          });
      }

      // Delete related records first
      await db.query('DELETE FROM comments WHERE post_id = $1', [postId]);
      await db.query('DELETE FROM likes WHERE post_id = $1', [postId]);
      
      // Delete the post
      await db.query('DELETE FROM posts WHERE id = $1', [postId]);

      res.json({ success: true });
  } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ 
          success: false, 
          error: 'Database error' 
      });
  }
});


// Profile page route
app.get("/profile", async (req, res) => {
  if (!req.session.user && !req.session.alumni) {
      return res.redirect("/login");
  }

  try {
      const user = req.session.user || req.session.alumni;
      if (user.type === 'alumni') {
          const result = await db.query(
              "SELECT * FROM alumni WHERE prn = $1",
              [user.prn]
          );
          if (result.rows.length > 0) {
              res.render("profile.ejs", { user: { ...user, ...result.rows[0] } });
          }
      } else {
          res.render("profile.ejs", { user });
      }
  } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
  }
});

// Update password route
app.post("/update-password", async (req, res) => {
  if (!req.session.user && !req.session.alumni) {
      return res.redirect("/login");
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;
  const user = req.session.user || req.session.alumni;
  const table = user.type === 'alumni' ? 'alumni' : 'students';

  try {
      // Verify current password
      const result = await db.query(
          `SELECT * FROM ${table} WHERE prn = $1 AND password = $2`,
          [user.prn, currentPassword]
      );

      if (result.rows.length === 0) {
          return res.render("profile.ejs", { 
              user,
              error: "Current password is incorrect"
          });
      }

      if (newPassword !== confirmPassword) {
          return res.render("profile.ejs", { 
              user,
              error: "New passwords do not match"
          });
      }

      // Update password
      await db.query(
          `UPDATE ${table} SET password = $1 WHERE prn = $2`,
          [newPassword, user.prn]
      );

      res.render("profile.ejs", { 
          user,
          success: "Password updated successfully"
      });
  } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
  }
});

// Update profile route (Alumni only)
app.post("/update-profile", async (req, res) => {
  if (!req.session.alumni) {
      return res.redirect("/login");
  }

  const { currentPosition, company, location, email } = req.body;
  const user = req.session.alumni;

  try {
      await db.query(
          `UPDATE alumni 
           SET current_position = $1, company = $2, location = $3, email = $4 
           WHERE prn = $5`,
          [currentPosition, company, location, email, user.prn]
      );

      // Update session with new information
      req.session.alumni = {
          ...user,
          current_position: currentPosition,
          company,
          location,
          email
      };

      res.render("profile.ejs", { 
          user: req.session.alumni,
          success: "Profile updated successfully"
      });
  } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
  }
});


//admin functionalities 
// Render Add Alumni Form
app.get("/add_alumni", (req, res) => {
  if (req.session.admin) {
    res.render("admin/add_alumni");
  } else {
    res.redirect("/admin_login");
  }
});

app.post("/add_alumni", async (req, res) => {
  const { prn, name, email, password, department, batch_year, current_position, company, location } = req.body;

  // Validate input
  if (!prn || !name || !email || !password || !department || !batch_year || !current_position || !company || !location) {
    return res.status(400).send("All fields are required.");
  }

  try {
    // Insert the new alumni into the database
    await db.query(
      "INSERT INTO alumni (prn, name, email, password, department, batch_year, current_position, company, location, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())",
      [prn, name, email, password, department, batch_year, current_position, company, location]
    );

    // Redirect back to the admin dashboard or a success page
    res.redirect("/admin_home");
  } catch (err) {
    console.error("Error adding alumni:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Render Add Student Form
app.get("/add_student", (req, res) => {
  if (req.session.admin) {
    res.render("admin/add_student");
  } else {
    res.redirect("/admin_login");
  }
});

app.post("/add_student", async (req, res) => {
  const { prn, name, email, password, department, batch_year } = req.body;

  // Validate input
  if (!prn || !name || !email || !password || !department || !batch_year) {
    return res.status(400).send("All fields are required.");
  }

  try {
    // Insert the new student into the database
    await db.query(
      "INSERT INTO students (prn, name, email, password, department, batch_year, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())",
      [prn, name, email, password, department, batch_year]
    );

    // Redirect back to the admin dashboard or a success page
    res.redirect("/admin_home");
  } catch (err) {
    console.error("Error adding student:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Render Alumni List
app.get("/alumni_list", async (req, res) => {
  if (req.session.admin) {
    try {
      const alumniResult = await db.query("SELECT * FROM alumni ORDER BY batch_year DESC");
      res.render("admin/alumni_list", { alumni: alumniResult.rows });
    } catch (err) {
      console.error("Error fetching alumni list:", err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect("/admin_login");
  }
});

// Render Students List
app.get("/students_list", async (req, res) => {
  if (req.session.admin) {
    try {
      const studentsResult = await db.query("SELECT * FROM students ORDER BY batch_year DESC");
      res.render("admin/students_list", { students: studentsResult.rows });
    } catch (err) {
      console.error("Error fetching students list:", err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.redirect("/admin_login");
  }
});

app.get("/import_students", (req, res) => {
  const user = req.session.admin; // Ensure only admins can access this page
  if (!user) {
    return res.redirect("/login");
  }

  res.render("admin/import");
});

// Route to import students to alumni
app.post("/import_students_to_alumni", async (req, res) => {
  const { batch_year, current_position, company, location } = req.body;

  // Validate input
  if (!batch_year || !current_position || !company || !location) {
    return res.status(400).send("All fields are required.");
  }

  try {
    // Fetch students from the students table based on the batch year
    const students = await db.query(
      "SELECT prn, name, email, password, department FROM students WHERE batch_year = $1",
      [batch_year]
    );

    if (students.rows.length === 0) {
      return res.status(404).send("No students found for the given batch year.");
    }

    // Insert each student into the alumni table with additional fields
    for (const student of students.rows) {
      await db.query(
        "INSERT INTO alumni (prn, name, email, password, department, batch_year, current_position, company, location, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())",
        [
          student.prn,
          student.name,
          student.email,
          student.password,
          student.department,
          batch_year,
          current_position,
          company,
          location,
        ]
      );
    }

    // Redirect back to the admin dashboard with a success message
    res.redirect("/admin_home");
  } catch (err) {
    console.error("Error importing students to alumni:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.redirect("/"); // Redirect to the login page after logout
  });
});

// Route to like a post
app.post("/like_post/:id", async (req, res) => {
  const postId = req.params.id;
  const user = req.session.user || req.session.alumni || req.session.admin;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const likeResult = await db.query(
      "SELECT * FROM likes WHERE post_id = $1 AND user_prn = $2",
      [postId, user.prn || user.username]
    );

    let userLiked;
    if (likeResult.rows.length > 0) {
      // Unlike the post
      await db.query("DELETE FROM likes WHERE post_id = $1 AND user_prn = $2", [
        postId,
        user.prn || user.username,
      ]);
      userLiked = false;
    } else {
      // Like the post
      await db.query(
        "INSERT INTO likes (post_id, user_prn) VALUES ($1, $2)",
        [postId, user.prn || user.username]
      );
      userLiked = true;
    }

    // Get the updated like count
    const likeCountResult = await db.query(
      "SELECT COUNT(*) AS like_count FROM likes WHERE post_id = $1",
      [postId]
    );

    res.json({
      userLiked,
      likeCount: likeCountResult.rows[0].like_count,
    });
  } catch (err) {
    console.error("Error toggling like:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to add a comment
app.post("/comment_post/:id", async (req, res) => {
  const postId = req.params.id;
  const { comment } = req.body;
  const user = req.session.user || req.session.alumni || req.session.admin;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Validate the comment input
  if (!comment || comment.trim() === "") {
    return res.status(400).json({ error: "Comment cannot be empty!" });
  }

  try {
    const authorName = user.name;
    await db.query(
      "INSERT INTO comments (post_id, user_prn, comment) VALUES ($1, $2, $3)",
      [postId, user.prn || user.username, comment.trim()]
    );

    // Handle AJAX requests
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res.json({
        authorName,
        comment: comment.trim(),
      });
    }

    // Handle non-AJAX requests (fallback)
    const referrer = req.get("Referrer") || "/";
res.redirect(referrer);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete comment route
app.post("/delete_comment/:id", async (req, res) => {
  const commentId = req.params.id;
  const user = req.session.user || req.session.alumni || req.session.admin;

  if (!user) {
    return res.status(401).send("Unauthorized");
  }

  try {
    // Verify that the comment belongs to the user
    const commentResult = await db.query(
      "SELECT * FROM comments WHERE id = $1 AND user_prn = $2",
      [commentId, user.prn || user.username]
    );

    if (commentResult.rows.length === 0) {
      return res.status(403).send("You are not authorized to delete this comment.");
    }

    // Delete the comment
    await db.query("DELETE FROM comments WHERE id = $1", [commentId]);

    // Redirect back to the referring page or fallback to "/"
    const referrer = req.get("Referrer") || "/";
    res.redirect(referrer);
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
