# Job Tracker Automation

A browser automation-based job tracking system built to reduce the manual effort involved in managing job applications across multiple platforms.

The project uses Playwright and structured parsing logic to capture job-related information from career portals, organize application data, prevent duplicate tracking entries, and maintain a centralized job application record automatically.

This project was created to solve a real-world problem faced during large-scale job applications:
keeping track of applications, referral IDs, job links, statuses, locations, and job details without manually maintaining spreadsheets after every application.

## What the Project Does

The automation accepts a job URL from supported career portals, opens the page using Playwright, analyzes the page structure, identifies whether the page is a listing page or a detailed job page, extracts relevant job information, validates duplicates, and stores the structured data into Excel.

The system is designed to work with different types of job portals instead of being restricted to a single website or a single company.

The workflow includes:

* browser-based job page automation
* listing page handling
* job detail page handling
* automatic job ID detection
* company detection from URLs
* work mode detection
* location detection
* duplicate prevention using job links
* structured Excel-based job tracking
* reusable parsing architecture for multi-platform support

## Information Captured

The tracker maintains structured records for:

* Company
* Role
* Experience requirement
* Location
* Skills
* Work mode
* Job ID / Job Number / Reference Code
* Job link
* Application status
* Referral status
* Posting information

The system supports automatic detection where possible and falls back to user confirmation for fields that may vary heavily across platforms.

## Architecture

The project is organized into reusable modules to keep the automation scalable and maintainable.

### `playwrightTest.js`

Responsible for:

* launching the browser
* navigating job pages
* identifying page types
* coordinating extraction flow
* handling user confirmations
* creating structured job objects

### `jobParser.js`

Responsible for:

* detecting job IDs from URLs
* detecting companies from domains
* detecting work modes from page content
* detecting locations from page text
* identifying listing pages vs detail pages
* handling reusable parsing logic

### `excelService.js`

Responsible for:

* Excel creation and management
* duplicate validation
* structured data persistence
* application record storage

## Technologies Used

* Node.js
* Playwright
* JavaScript
* XLSX

## Supported Automation Flow

### Listing/Search Pages

The automation identifies search/listing pages, extracts visible job card information, and prepares structured tracking data from the selected listing.

### Job Detail Pages

The automation identifies detailed job pages, extracts available information from the page content, detects structured fields such as work mode and job identifiers, and stores the information in a centralized tracker.

## Key Design Goals

The project focuses on:

* reducing repetitive manual tracking work
* creating a reusable workflow across multiple job platforms
* centralizing application records
* improving referral tracking
* preventing duplicate applications
* building scalable parsing architecture instead of hardcoded portal-specific automation
* balancing automatic extraction with user confirmation for better reliability

## Why This Project Exists

Applying to jobs across multiple portals often results in:

* lost application records
* duplicate applications
* scattered job links
* missing referral tracking
* inconsistent personal tracking workflows

This project aims to create a more structured and scalable job application tracking workflow using browser automation and reusable extraction logic.
