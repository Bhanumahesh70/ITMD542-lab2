const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Read contacts from JSON file
function readContacts() {
  const data = fs.readFileSync(path.resolve(__dirname, '..', 'data', 'contacts.json'));
  return JSON.parse(data);
}

// Write contacts to JSON file
function writeContacts(contacts) {
  fs.writeFileSync(path.resolve(__dirname, '..', 'data', 'contacts.json'), JSON.stringify(contacts, null, 2));
}

// GET all contacts
router.get('/contacts', function(req, res, next) {
  const contacts = readContacts();
  res.render('contact/list', { contacts });
});
// GET create contact form
router.get('/contacts/create', function(req, res, next) {
    const emptyContact = {}; // Create an empty contact object
    res.render('contact/create', { contact: emptyContact }); // Pass the empty contact object to the template
});
// GET contact by ID
router.get('/contacts/:id', function(req, res, next) {
  const contacts = readContacts();
  console.log("Requested Contact ID:", req.params.id); // Log the requested contact ID for debugging
  console.log("All Contacts:", contacts); // Log all contacts for debugging
  const contact = contacts.find(c => c.id === req.params.id);
  console.log("Found Contact:", contact); // Log the found contact for debugging
  if (!contact) {
    // Handle case when contact is not found
    return res.status(404).send('Contact not found');
  }
  res.render('contact/show', { contact });
});



// POST create contact
router.post('/contacts', function(req, res, next) {
  const contacts = readContacts();
  const newContact = {
    id: Math.random().toString(36).substr(2, 9),
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    notes: req.body.notes,
    date: new Date().toISOString()
  };
  contacts.push(newContact);
  writeContacts(contacts);
  res.redirect('/contacts');
});

// GET edit contact form
router.get('/contacts/:id/edit', function(req, res, next) {
  const contacts = readContacts();
  const contact = contacts.find(c => c.id === req.params.id);
  res.render('contact/edit', { contact });
});

// POST update contact
router.post('/contacts/:id', function(req, res, next) {
  const contacts = readContacts();
  const index = contacts.findIndex(c => c.id === req.params.id);
  contacts[index] = {
    id: req.params.id,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    notes: req.body.notes,
    date: new Date().toISOString()
  };
  writeContacts(contacts);
  res.redirect(`/contacts/${req.params.id}`);
});

// DELETE contact
router.delete('/contacts/:id', function(req, res, next) {
  const contacts = readContacts();
  const index = contacts.findIndex(c => c.id === req.params.id);
  contacts.splice(index, 1);
  writeContacts(contacts);
  res.redirect('/contacts');
});

module.exports = router;
