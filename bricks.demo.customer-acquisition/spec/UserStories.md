# Customer acquisition tracker
## Use cases
### Register a New Customer
#### Description
As an Employee, I want to register a new Customer so that I can later add Contact Points and track interactions for this business.

#### Nominal Flow
- Employee navigates to the "Customers" page.
- Employee taps/clicks the "New Customer" button
- Employee fills in required fields (name, industry, website, etc.).
- Employee submits the form.
- System saves the new Customer and confirms creation.

#### Alternate / Error Cases
-   Employee submits a form with **missing required fields**: system shows validation errors.
-   Employee enters a **duplicate Customer name**: system warns about potential duplication but allows override.

#### Acceptance Tests
```gherkin
Feature: Register a New Customer

Scenario: Successful creation
  Given I am logged in as an Employee
  When I submit a new Customer with valid information
  Then the Customer is saved
  And a confirmation message is shown

Scenario: Missing required fields
  Given I am logged in as an Employee
  When I submit a new Customer with missing name
  Then the system shows a validation error

Scenario: Duplicate Customer name
  Given a Customer named "Acme Corp" exists
  When I submit a new Customer named "Acme Corp"
  Then the system warns about duplication
  And allows me to override
```

### Add a New Contact Point
#### Description
As an Employee, I want to add a new Contact Point to a Customer so I can track interactions with this individual.

#### Nominal Flow
-   Employee selects an existing Customer.
-   Employee clicks to the “Add Contact Point” button.
-   Employee enters the contact’s name, role, email, phone, etc.
-   Employee submits the form.
-   System saves the Contact Point under the selected Customer.

#### Alternate / Error Cases
-   Employee submits **incomplete contact info**: validation error.
-   **Duplicate contact** detected: system warns but allows override.

#### Acceptance Tests
```gherkin
Feature: Add Contact Point

Scenario: Successful addition
  Given I am logged in as an Employee
  And I have selected Customer "Acme Corp"
  When I submit a new Contact Point with valid info
  Then the Contact Point is saved under "Acme Corp"

Scenario: Missing required fields
  Given I am logged in as an Employee
  When I submit a Contact Point without name
  Then the system shows a validation error

Scenario: Duplicate contact
  Given "John Doe" already exists for "Acme Corp"
  When I try to add "John Doe" again
  Then the system warns about duplication
```

### Update Existing Customer
#### Description
As an Employee, I want to update a Customer’s information to ensure the business data remains accurate.

#### Nominal Flow
-   Employee selects a Customer.
-   Employee clicks the “Edit Customer” button.
-   Employee updates fields as needed.
-   Employee submits the changes.
-   System saves the updated information and confirms success.

#### Alternate / Error Cases
-   Employee submits **empty required fields**: validation error.
    
-   Employee tries to rename the Customer to a **name that conflicts with another**: duplication warning.

#### Acceptance Tests
```gherkin
Feature: Update Customer

Scenario: Successful update
  Given I am logged in as an Employee
  And I have selected Customer "Acme Corp"
  When I change the website and submit
  Then the updated information is saved

Scenario: Missing required fields
  Given I am logged in as an Employee
  When I remove the Customer name and submit
  Then the system shows a validation error

Scenario: Duplicate Customer name
  Given a Customer named "Beta Inc" exists
  When I rename "Acme Corp" to "Beta Inc"
  Then the system warns about duplication
```

### Update Existing Contact Point
#### Description
As an Employee, I want to update a Contact Point’s details to keep contact information accurate.

#### Nominal Flow
-   Employee selects a Customer.
-   Employee selects a Contact Point under that Customer.
-   Employee clicks "Edit Contact Point" button.
-   Employee updates fields and submits.
-   System saves changes and confirms success.

#### Alternate / Error Cases
-   **Missing required fields**: validation error.
-   **Duplicate email/phone**: system warns.

#### Acceptance Tests
```gherkin
Feature: Update Contact Point

Scenario: Successful update
  Given I am logged in as an Employee
  And I have selected Contact Point "John Doe"
  When I update the phone number and submit
  Then the updated info is saved

Scenario: Missing required fields
  Given I am logged in as an Employee
  When I remove the contact's name and submit
  Then the system shows a validation error

Scenario: Duplicate email
  Given another Contact Point with email "john@example.com" exists
  When I update this contact's email to "john@example.com"
  Then the system warns about duplication
```

### Record an Interaction
#### Description
As an Employee, I want to record an interaction summary so that a written history of communications is maintained.

#### Nominal Flow
-   Employee selects a Customer.
-   Employee selects a Contact Point.
-   Employee clicks "Add Interaction" button.
-   Employee enters date, type, and message.
-   Employee submits.
-   System saves the interaction and confirms.

#### Alternate / Error Cases
-   **Missing required fields**: validation error.
-   **Interaction date in the future**: warning.

#### Acceptance Tests
```gherkin
Feature: Record Interaction Summary

Scenario: Successful recording
  Given I am logged in as an Employee
  And I have selected Contact Point "John Doe"
  When I add an interaction with a message and date
  Then the interaction is saved

Scenario: Missing fields
  Given I am logged in as an Employee
  When I submit an interaction without a message
  Then the system shows a validation error

Scenario: Future date
  Given I am logged in as an Employee
  When I submit an interaction with a future date
  Then the system shows a warning
```

### Interaction History
#### Description
As an Employee, I want to view all interactions for a Customer so that I can review past exchanges or take over communication.

#### Nominal Flow
-   Employee selects a Customer.
-   System displays a chronological list of all Interaction Summaries for all Contact Points under that Customer.

#### Alternate / Error Cases
**No interactions exist**: system displays an empty state message "No interactions recorded yet".

#### Acceptance Tests
```gherkin
Feature: View Interaction History

Scenario: Display interaction list
  Given I am logged in as an Employee
  When I select Customer "Acme Corp"
  Then all interactions for that Customer are displayed chronologically

Scenario: No interactions
  Given I am logged in as an Employee
  And Customer "NewCo" has no interactions
  When I select "NewCo"
  Then the system displays "No interactions recorded yet"
```

### Customers Overview
#### Description
As an Employee, I want a dashboard overview of all Customers so that I can identify prospects needing attention.

#### Nominal Flow
-   Employee navigates to the "Dashboard" page.
-   System displays a list of all Customers with summary metrics (e.g., last contact date, number of interactions).
-   System highlights Customers who have not been contacted recently.

#### Alternate / Error Cases
**No Customers exist**: system shows an empty state message.

#### Acceptance Tests
```gherkin
Feature: Customer Overview Dashboard

Scenario: Display overview
  Given I am logged in as an Employee
  When I navigate to the Dashboard
  Then all Customers are displayed with last contact date and interaction count
  And Customers not contacted recently are highlighted

Scenario: No Customers
  Given I am logged in as an Employee
  And no Customers exist
  When I navigate to the Dashboard
  Then the system displays "No Customers available"
```