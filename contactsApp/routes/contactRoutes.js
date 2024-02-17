const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const sanitizeConfig = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'escape',
   disallowedTags: ['script', 'style'],
   allowedAttributes: {}, // No attributes allowed
   allowedClasses: {} // No classes allowed
};

// Read the contacts from JSON file
function readContacts() {
  const data = fs.readFileSync(
    path.resolve(__dirname, "..", "data", "contacts.json")
  );
  const contacts = JSON.parse(data);

  // Filter out contacts that have only 'id' and 'date' and not display them
  return contacts.filter((contact) => Object.keys(contact).length > 2);
}

// Write contacts to JSON file
function writeContacts(contacts) {
  fs.writeFileSync(
    path.resolve(__dirname, "..", "data", "contacts.json"),
    JSON.stringify(contacts, null, 2)
  );
}

// GET all contacts 
router.get("/contacts", function (req, res, next) {
  const contacts = readContacts();
  res.render("contact/display_all_contacts", { contacts });
});
// GET create new contact form method
router.get("/contacts/create", function (req, res, next) {
  const emptyContact = {}; // Create an empty contact object
  res.render("contact/create_contact", { contact: emptyContact }); // Pass the empty contact object to the template
});
// GET contact by ID
router.get("/contacts/:id", function (req, res, next) {
  const contacts = readContacts();
  console.log("Requested Contact ID:", req.params.id); // Log the requested contact ID
  console.log("All Contacts:", contacts); // Log all contacts
  const contact = contacts.find((c) => c.id === req.params.id);
  console.log("Found Contact:", contact); // Log the found contact
  if (!contact) {
    // Handle case when contact is not found
    //return res.status(404).send("Contact not found");
    return res.render("contact/deleted_contact",{contacts});
  }
  res.render("contact/show_contact", { contact });
});

// POST create contact 
router.post("/contacts", function (req, res, next) {
 // Validation
 const { firstName, lastName, email, notes } = req.body;
 if (!firstName.trim() || !lastName.trim()) {
   return res.status(400).send("First Name and Last Name are required");
 }

 // Sanitization (Removing leading/trailing whitespace and HTML/CSS/JavaScript injection)
 const sanitizedFirstName = sanitizeHtml(firstName.trim(), sanitizeConfig);
 const sanitizedLastName = sanitizeHtml(lastName.trim(), sanitizeConfig);
 const sanitizedEmail = sanitizeHtml(email.trim(), sanitizeConfig);
 const sanitizedNotes = sanitizeHtml(notes.trim(),sanitizeConfig);

 const newContact = {
   id: Math.random().toString(36).substr(2, 9),
   firstName: sanitizedFirstName,
   lastName: sanitizedLastName,
   email: sanitizedEmail,
   notes: sanitizedNotes,
   date: new Date().toISOString(),
 };

 const contacts = readContacts();
 contacts.push(newContact);
 writeContacts(contacts);
 res.redirect("/contacts");
});

// POST update contact
router.post("/contacts/:id", function (req, res, next) {
  const contacts = readContacts();
  const index = contacts.findIndex((c) => c.id === req.params.id);

  // If contact not found, return 404
  if (index === -1) {
    return res.status(404).send("Contact not found");
  }

  // Sanitize user input before updating contact
  const sanitizedFirstName = sanitizeHtml(req.body.firstName.trim(), {
    disallowedTagsMode: 'escape',
    disallowedTags: ['script', 'style'],
    allowedAttributes: {} // No attributes allowed
  });
  const sanitizedLastName = sanitizeHtml(req.body.lastName.trim(), {
    disallowedTagsMode: 'escape',
    disallowedTags: ['script', 'style'],
    allowedAttributes: {} // No attributes allowed
  });
  const sanitizedEmail = sanitizeHtml(req.body.email.trim(), {
    disallowedTagsMode: 'escape',
    disallowedTags: ['script', 'style'],
    allowedAttributes: {} // No attributes allowed
  });
  const sanitizedNotes = sanitizeHtml(req.body.notes.trim(), {
    disallowedTagsMode: 'escape',
    disallowedTags: ['script', 'style'],
    allowedAttributes: {} // No attributes allowed
  });

  contacts[index] = {
    id: req.params.id,
    firstName: sanitizedFirstName,
    lastName: sanitizedLastName,
    email: sanitizedEmail,
    notes: sanitizedNotes,
    date: new Date().toISOString(),
  };
  
  writeContacts(contacts);
  res.redirect(`/contacts/${req.params.id}`);
});

 // DELETE contact
router.delete("/contacts/:id", function (req, res, next) {
  let contacts = readContacts();
  const index = contacts.findIndex((c) => c.id === req.params.id);
  if (index !== -1) {
    contacts.splice(index, 1);
    console.log("one Contact is deleted ");
    writeContacts(contacts);
    console.log("Redirecting to all contacts after deleting the contact");
    res.redirect("/contacts");
  } else {
    console.log(
      "The contact is not found to delete. Redirecting to contact not found error page"
    );
    res.status(404).send("Contact not found");
  }
}); 



module.exports = router;
