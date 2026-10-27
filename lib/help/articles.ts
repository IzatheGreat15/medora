import { HelpArticleData } from "./type";

export const helpArticles: HelpArticleData[] = [

    {
        slug: "dashboard",
        title: "Dashboard overview",
        description:
            "Learn how to monitor your clinic's appointments, review booking activity, check doctor availability, and track clinic performance from one place.",
        category: "Dashboard",
        readTime: "5 min read",
        overviewTitle: "Understanding your dashboard",
        overview:
            "Your Medora dashboard gives you a centralized view of your clinic's daily operations. Review appointment summaries, monitor booking statuses, check which doctors are on duty, and analyze appointment trends across your branches.",
        steps: [
            {
                title: "Review your clinic overview",
                description:
                    "At the top of your dashboard, you'll find summary cards showing today's appointments, bookings awaiting approval, the number of doctors, and appointments completed this month. Use these figures to quickly assess your clinic's activity.",
                image: "/images/help/dashboard/clinic-overview.webp",
                imageAlt:
                    "Clinic overview with appointment, approval, doctor, and monthly completion summary cards",
            },
            {
                title: "View today's appointments",
                description:
                    "The Today's Appointments section displays scheduled visits, including the appointment time, patient name, service, assigned doctor, branch, and booking status. Use the branch and status filters to narrow the list and find the appointments you need. Select Manage all bookings to open the full bookings page.",
                image: "/images/help/dashboard/todays-appointments.webp",
                imageAlt:
                    "Today's appointments list showing patient details, doctors, branches, times, and statuses",
            },
            {
                title: "Check doctors on duty",
                description:
                    "The Doctors on Duty Today section groups doctors by branch. Review each doctor's name, specialty, scheduled working hours, and current duty status, such as On duty, On break, or Off duty. This helps your team understand doctor availability throughout the day.",
                image: "/images/help/dashboard/doctors-on-duty.webp",
                imageAlt:
                    "Doctors grouped by clinic branch with specialties, working hours, and duty statuses",
            },
            {
                title: "Explore clinic analytics",
                description:
                    "Use the Clinic Analytics section to review appointment activity and branch performance for your selected reporting period. Change the date range to explore activity over different periods.",
                image: "/images/help/dashboard/clinic-analytics.webp",
                imageAlt:
                    "Clinic analytics dashboard showing appointment trends, booking status, popular services, and branch performance",
            },
            {
                title: "Understand the analytics charts",
                description:
                    "Appointment Trends compares bookings and completed appointments over time. Booking Status shows the distribution of appointments by status. Popular Services highlights services with the most appointments, while Branch Performance compares appointment volumes across your clinic branches.",
            },
        ],
        relatedGuides: [
            {
                title: "View and manage bookings",
                description:
                    "Find appointments and review their statuses.",
                href: "/help/bookings/view-bookings",
            },
            {
                title: "Approve or decline bookings",
                description:
                    "Learn how to process appointment requests.",
                href: "/help/bookings/approve-booking",
            },
            {
                title: "Manage doctor schedules",
                description:
                    "Review doctor availability and working hours.",
                href: "/help/doctors/manage-schedules",
            },
        ],
    },



    {
        slug: "bookings/view-bookings",
        title: "View and manage bookings",
        description:
            "Learn how to find appointments, switch between table and calendar views, filter bookings, and review appointment details in Medora.",
        category: "Bookings",
        readTime: "6 min read",
        overviewTitle: "Understanding the bookings page",
        overview:
            "The Bookings page gives your clinic team a central place to review appointments across branches. You can monitor booking statuses, search for patients or doctors, filter the list, switch between table and calendar views, and open individual bookings for more information.",
        steps: [
            {
                title: "Review the booking summary",
                description:
                    "At the top of the page, the summary cards show the total number of bookings, appointments pending approval, confirmed appointments, and completed appointments. Use these figures to get a quick overview of your clinic's bookings.",
                image: "/images/help/bookings/booking-summary.webp",
                imageAlt:
                    "Bookings summary cards showing all bookings, pending approval, confirmed, and completed appointments",
            },
            {
                title: "Search for a patient or doctor",
                description:
                    "Use the search field above the bookings table to find appointments by patient or doctor. Enter the relevant name in the search field to narrow the displayed results.",
                image: "/images/help/bookings/bookings-list.webp",
                imageAlt:
                    "Bookings page with the patient and doctor search field",
            },
            {
                title: "Filter bookings by status and branch",
                description:
                    "Use the All statuses dropdown to narrow appointments by their current status. Use the All branches dropdown to view bookings associated with a particular branch. You can combine the available filters with your search to find the appointments you need.",
                image: "/images/help/bookings/booking-filters.webp",
                imageAlt:
                    "Booking search, status filter, and branch filter",
            },
            {
                title: "Understand the table view",
                description:
                    "The table view organizes appointments into columns for patient, date and time, service, doctor, branch, status, and action. Each patient entry includes a booking reference, making it easier to distinguish between appointments.",
                image: "/images/help/bookings/bookings-table.webp",
                imageAlt:
                    "Bookings table displaying patient information, schedule, service, doctor, branch, status, and details action",
            },
            {
                title: "Switch to calendar view",
                description:
                    "Select Calendar beside the Table option to switch to the calendar view. Use the calendar to review appointment schedules visually and identify when appointments are arranged. Return to Table whenever you need to review the appointment list and its status labels.",
                image: "/images/help/bookings/bookings-calendar.webp",
                imageAlt:
                    "Medora bookings calendar view",
            },
            {
                title: "Review an appointment's details",
                description:
                    "Select Details on an appointment row to open its booking information. Review the patient's details, appointment schedule, selected service, assigned doctor, branch, and current status before taking any further action.",
                image: "/images/help/bookings/booking-details.webp",
                imageAlt:
                    "Appointment details view in Medora",
            },
            {
                title: "Understand booking statuses",
                description:
                    "The Status column indicates the current state of each appointment. Pending bookings are awaiting a decision, Confirmed bookings have been accepted, Completed bookings have been marked as completed, and Declined bookings have been declined.",
                image: "/images/help/bookings/booking-statuses.webp",
                imageAlt:
                    "Booking status labels for pending, confirmed, completed, and declined appointments",
            },
        ],
        relatedGuides: [
            {
                title: "Add a manual booking",
                description:
                    "Create an appointment for a patient.",
                href: "/help/bookings/add-manual-booking",
            },
            {
                title: "Approve or decline bookings",
                description:
                    "Learn how to process pending appointment requests.",
                href: "/help/bookings/approve-booking",
            },
            {
                title: "Manage doctor schedules",
                description:
                    "Review doctor availability and working hours.",
                href: "/help/doctors/manage-schedules",
            },
        ],
    },



    {
        slug: "bookings/add-manual-booking",
        title: "Add a manual booking",
        description:
            "Learn how to create an appointment on behalf of a patient using the New booking form.",
        category: "Bookings",
        readTime: "5 min read",
        overviewTitle: "When to use a manual booking",
        overview:
            "Use a manual booking when a patient schedules an appointment directly with your clinic, such as by phone or in person. Enter the patient's contact information, select the appointment details, and save the booking in Medora.",
        steps: [
            {
                title: "Open the New booking form",
                description:
                    "Go to Bookings from the sidebar. Select the + button above the bookings list to open the New booking form.",
                image: "/images/help/bookings/open-new-booking.webp",
                imageAlt:
                    "Bookings page with the New booking form opened",
            },
            {
                title: "Enter the patient's information",
                description:
                    "Under Patient information, enter the patient's full name, email address, and phone number. Fields marked with an asterisk (*) are required.",
                image: "/images/help/bookings/patient-information.webp",
                imageAlt:
                    "Patient name, email address, and phone number fields",
            },
            {
                title: "Select a service and doctor",
                description:
                    "Under Appointment details, choose the service the patient needs and the doctor who will provide it. Make sure the selected doctor is appropriate for the requested service.",
            },
            {
                title: "Choose the clinic branch",
                description:
                    "Select the branch where the appointment will take place. Check that the branch matches the patient's preferred location and the intended appointment.",
            },
            {
                title: "Set the appointment date and time",
                description:
                    "Choose the appointment date, enter the start time, and select the appointment duration. Review these values carefully to ensure the booking reflects the intended schedule.",
            },
            {
                title: "Add patient notes if needed",
                description:
                    "Use Patient notes to record relevant information for the appointment. This field is optional. Only include information appropriate for your clinic's workflow and patient privacy requirements.",
            },
            {
                title: "Review and save the booking",
                description:
                    "Review the patient information, service, doctor, branch, date, start time, and duration. Select Save to submit the booking, or Cancel if you want to leave the form without saving.",
            },
        ],
        relatedGuides: [
            {
                title: "View and manage bookings",
                description:
                    "Find appointments and review their statuses.",
                href: "/help/bookings/view-bookings",
            },
            {
                title: "Approve or decline bookings",
                description:
                    "Learn how to process pending appointment requests.",
                href: "/help/bookings/approve-booking",
            },
            {
                title: "Manage doctor schedules",
                description:
                    "Review doctor availability and working hours.",
                href: "/help/doctors/manage-schedules",
            },
        ],
    },


    {
        slug: "bookings/approve-booking",
        title: "Approve or decline bookings",
        description:
            "Learn how to review appointment requests, decide whether to approve or decline a booking, and understand what to check before taking action.",
        category: "Bookings",
        readTime: "5 min read",
        overviewTitle: "Review bookings before making a decision",
        overview:
            "The booking details panel gives you the information needed to review an appointment request. Check the patient's contact information, appointment date and time, branch, doctor, and other booking details before approving or declining the booking.",
        steps: [
            {
                title: "Open the booking details",
                description:
                    "Go to Bookings and locate the appointment you want to review. Select Details on the corresponding row to open the booking details panel.",
                image: "/images/help/bookings/open-booking-details.webp",
                imageAlt:
                    "Bookings list with the Details action for an appointment",
            },
            {
                title: "Review the booking status",
                description:
                    "At the top of the panel, check the booking status. In the example shown, the booking is Pending, meaning it is awaiting a decision. Confirm that the booking is still awaiting approval before proceeding.",
                image: "/images/help/bookings/booking-details-status.webp",
                imageAlt:
                    "Booking details panel showing a Pending status",
            },
            {
                title: "Verify the patient's information",
                description:
                    "Check the patient's name, email address, and phone number. Make sure the information is complete and appears consistent with the appointment request. If anything needs clarification, verify it with the patient before making a decision.",
                image: "/images/help/bookings/booking-patient-information.webp",
                imageAlt:
                    "Patient information displayed in the booking details panel",
            },
            {
                title: "Check the appointment details",
                description:
                    "Review the appointment date, start time, duration, branch, and assigned doctor. Confirm that the requested appointment is appropriate for the selected branch and doctor and that the schedule can be accommodated.",
                image: "/images/help/bookings/booking-appointment-information.webp",
                imageAlt:
                    "Appointment date, time, duration, branch, and doctor in booking details",
            },
            {
                title: "Know when to approve a booking",
                description:
                    "Approve the booking when the patient information is sufficiently complete, the requested service and appointment details are correct, and the doctor, branch, and time can accommodate the appointment. Select Approve booking after completing your checks.",
                image: "/images/help/bookings/approve-booking-action.webp",
                imageAlt:
                    "Approve booking button in the booking details panel",
            },
            {
                title: "Know when to decline a booking",
                description:
                    "Decline the booking when the appointment cannot be accommodated, the requested schedule is unavailable, the selected doctor or branch cannot provide the requested service, or the request cannot proceed after necessary clarification. Where possible, contact the patient to explain the issue and discuss alternatives before declining. Select Decline booking when you have decided not to accept the request.",
                image: "/images/help/bookings/decline-booking-action.webp",
                imageAlt:
                    "Decline booking button in the booking details panel",
            },
            {
                title: "Confirm the action",
                description:
                    "Before selecting either action, make sure you have reviewed the correct appointment. Follow any confirmation prompt shown by Medora and check the booking status afterward to verify the result.",
            },
        ],
        relatedGuides: [
            {
                title: "View and manage bookings",
                description:
                    "Search, filter, and review appointments.",
                href: "/help/bookings/view-bookings",
            },
            {
                title: "Add a manual booking",
                description:
                    "Create an appointment on behalf of a patient.",
                href: "/help/bookings/add-manual-booking",
            },
            {
                title: "Manage doctor schedules",
                description:
                    "Review doctor availability and working hours.",
                href: "/help/doctors/manage-schedules",
            },
        ],
    },


    {
        slug: "branches/manage-branches",
        title: "Manage branches",
        description:
            "Learn how to view, search, add, edit, and manage the status of your clinic branches in Medora.",
        category: "Branches",
        readTime: "5 min read",
        overviewTitle: "Managing your clinic branches",
        overview:
            "The Branches page lets you manage the locations where your clinic operates. Review branch information, check how many doctors are assigned to each location, and use the available actions to maintain your clinic's branch records.",
        steps: [
            {
                title: "Review the branch summary",
                description:
                    "At the top of the page, the summary cards display the total number of branches, the number of active branches, and the number of doctors across branches. Use these figures to get a quick overview of your clinic's locations and staffing.",
                image: "/images/help/branches/branch-summary.webp",
                imageAlt:
                    "Branch summary cards showing total branches, active branches, and doctors across branches",
            },
            {
                title: "Understand active and inactive branches",
                description:
                    "The Status column indicates whether a branch is Active or Inactive. An active branch is marked as available within your clinic's branch records. An inactive branch is marked as not currently active. Before changing a branch's status, check whether doctors or upcoming appointments are associated with that location.",
                image: "/images/help/branches/branch-statuses.webp",
                imageAlt:
                    "Active and inactive branch status labels",
            },
            {
                title: "Delete a branch",
                description:
                    "The trash icon provides the branch deletion action. Before deleting a branch, verify that you have selected the correct location and check whether it has associated doctors, appointments, or historical records. Proceed only if deletion is appropriate for your clinic's workflow and any confirmation prompts have been reviewed.",
                image: "/images/help/branches/delete-branch.webp",
                imageAlt:
                    "Delete branch action in the Actions column",
            },
        ],
        relatedGuides: [
            {
                title: "Add a branch",
                description:
                    "Learn how to create a new clinic branch and enter its basic information and contact details.",
                href: "/help/branches/add-a-branch",
            },
            {
                title: "Edit a branch",
                description:
                    "Learn how to update branch details, configure opening hours, manage branch status, and review assigned doctors.",
                href: "/help/branches/edit-a-branch",
            },
            {
                title: "View and manage bookings",
                description:
                    "Find appointments and review their statuses.",
                href: "/help/bookings/view-bookings",
            },
        ],
    },


    {
        slug: "branches/add-a-branch",
        title: "Add a branch",
        description:
            "Learn how to add a new clinic branch and enter its address and contact information in Medora.",
        category: "Branches",
        readTime: "3 min read",
        overviewTitle: "Create a new clinic branch",
        overview:
            "Use the Add branch form when your clinic opens a new location or needs another branch in Medora. You can enter the branch's basic information and contact details first, then configure its doctors, opening hours, and appointment schedules later.",
        steps: [
            {
                title: "Open the Add branch form",
                description:
                    "Navigate to Branches using the sidebar. Select the + button above the branch list to open the Add branch form.",
                image: "/images/help/branches/open-add-branch.webp",
                imageAlt:
                    "Branches page with the Add branch form open",
            },
            {
                title: "Fill in the necessary branch information",
                description:
                    "Under Basic information, enter the branch name and full address. Then, under Contact details, provide the branch's contact phone number and, optionally, its contact email address. Fields marked with an asterisk (*) are required. Review the information carefully before proceeding.",
                image: "/images/help/branches/add-a-branch.webp",
                imageAlt:
                    "Branch name, address, phone number, and email fields in the Add branch form",
            },
            {
                title: "Understand what can be configured later",
                description:
                    "The Configure later information panel explains that doctors, opening hours, and appointment schedules can be configured after the branch is created. You do not need to configure these items in this form.",
            },
            {
                title: "Save the new branch",
                description:
                    "Review the branch name, address, phone number, and optional email address. Select Save to submit the form, or Cancel to leave without saving. After saving, check the branch list to verify that the new location appears.",
            },
        ],
        relatedGuides: [
            {
                title: "Manage branches",
                description:
                    "Search, filter, edit, and review your clinic branches.",
                href: "/help/branches/manage-branches",
            },
            {
                title: "Manage doctors",
                description:
                    "Manage doctor records and clinic assignments.",
                href: "/help/doctors/manage-doctors",
            },
            {
                title: "Manage doctor schedules",
                description:
                    "Learn about doctor availability and working hours.",
                href: "/help/doctors/manage-schedules",
            },
        ],
    },


    {
        slug: "branches/edit-a-branch",
        title: "Edit branch details and opening hours",
        description:
            "Learn how to update branch information, configure opening hours, manage branch status, and review doctors assigned to a location.",
        category: "Branches",
        readTime: "6 min read",
        overviewTitle: "Keep your branch information up to date",
        overview:
            "The branch details page lets you maintain a clinic location's basic information, contact details, opening hours, and status. You can also review the doctors assigned to that branch and navigate to doctor management when changes are needed.",
        steps: [
            {
                title: "Open the branch details page",
                description:
                    "Navigate to Branches from the sidebar. Find the branch you want to manage and select its edit action to open the branch details page.",
                image: "/images/help/branches/open-branch-details.webp",
                imageAlt:
                    "Branch list with the edit action for opening branch details",
            },
            {
                title: "Update the branch information",
                description:
                    "In the Branch details panel, review the branch name, branch code, address, contact phone, and contact email. Update the editable fields as needed. The branch code is read-only and is used to identify the branch.",
                image: "/images/help/branches/edit-branch-information.webp",
                imageAlt:
                    "Branch details panel with branch name, code, address, phone, and email",
            },
            {
                title: "Set the branch status",
                description:
                    "Use the Branch status dropdown to select the appropriate status for the location. Review the implications for your clinic's workflow before changing a branch from Active to Inactive or vice versa.",
            },
            {
                title: "Configure opening hours",
                description:
                    "In the Opening hours panel, configure the hours the branch is open to patients for each day of the week. Select Open for days when the branch operates, then set the opening and closing times. Leave the day unchecked when the branch is closed. Review each day's schedule carefully, including any shorter operating days.",
                image: "/images/help/branches/branch-opening-hours.webp",
                imageAlt:
                    "Weekly opening hours with Open checkboxes and opening and closing times",
            },
            {
                title: "Understand opening hours and doctor schedules",
                description:
                    "Branch opening hours describe when the location is open to patients. Doctor schedules are managed separately. Make sure the branch's opening hours and the schedules of its assigned doctors are consistent with the appointments your clinic intends to offer.",
            },
            {
                title: "Save your changes",
                description:
                    "After updating the branch information or opening hours, review your changes and select Save changes. Check the page afterward to verify that the updated details are displayed. If you no longer want to make changes, leave the fields unchanged rather than saving unintended edits.",
            },
            {
                title: "Delete a branch",
                description:
                    "The Delete button allows you to initiate branch deletion. Before proceeding, verify that you selected the correct branch and consider its assigned doctors and associated appointments. Follow any confirmation prompt shown by Medora and your clinic's data-retention procedures.",
            },
            {
                title: "Review doctors assigned to the branch",
                description:
                    "The Doctors at this branch section lists doctors assigned to the location, including their names, specialties, contact details, statuses, and available actions. Use the search field to find a doctor in the list.",
                image: "/images/help/branches/doctors-at-branch.webp",
                imageAlt:
                    "Doctors assigned to the branch with contact details, statuses, and actions",
            },
            {
                title: "Manage doctors at this branch",
                description:
                    "Select Manage doctors to navigate to doctor management. Use this section when you need to review doctor assignments or manage doctor profiles, services, and schedules. The available actions may also let you edit or remove individual doctor records.",
            },
        ],
        relatedGuides: [
            {
                title: "Manage branches",
                description:
                    "Search, filter, add, and review clinic branches.",
                href: "/help/branches/manage-branches",
            },
            {
                title: "Add a branch",
                description:
                    "Create a new branch and enter its basic details.",
                href: "/help/branches/add-branch",
            },
            {
                title: "Manage doctors",
                description:
                    "Maintain doctor profiles and branch assignments.",
                href: "/help/doctors/manage-doctors",
            },
            {
                title: "Manage doctor schedules",
                description:
                    "Configure doctor availability and working hours.",
                href: "/help/doctors/manage-schedules",
            },
        ],
    },

    {
        slug: "doctors/manage-doctors",
        title: "Manage doctors",
        description:
            "Learn how to view doctor profiles, search for doctors, review their contact details and branch assignments, and manage their active status in Medora.",
        category: "Doctors",
        readTime: "6 min read",
        overviewTitle: "Manage your clinic's doctors in one place",
        overview:
            "The Doctors page lets you view and manage the doctors registered in your clinic. You can search for doctors, review their specialties and contact details, check their branch assignments, and access actions to edit or delete a doctor. Summary cards provide an overview of your clinic's doctor records and statuses.",
        steps: [
            {
                title: "Open the Doctors page",
                description:
                    "Select Doctors from the sidebar to view the doctors registered in your clinic. The summary cards display the total number of doctors, active doctors, inactive doctors, and specialties represented in your clinic.",
                image: "/images/help/doctors/doctors-overview.webp",
                imageAlt:
                    "Doctors page showing summary cards",
            },
            {
                title: "Search for a doctor",
                description:
                    "Use the search field above the doctors table to find a doctor. Enter the available identifying information, such as the doctor's name, to narrow the list and locate the profile you want to review.",
                image: "/images/help/doctors/doctors-search.webp",
                imageAlt:
                    "Search field in the All doctors section",
            },
            {
                title: "Review doctor information",
                description:
                    "The All doctors table displays each doctor's name, specialty, contact details, assigned branches, and status. Review these details to confirm that you have selected the correct doctor and to check their current clinic assignments.",
                image: "/images/help/doctors/doctors-list.webp",
                imageAlt:
                    "Doctors table displaying doctor profiles, contact details, branches, and status",
            },
            {
                title: "Understand doctor statuses",
                description:
                    "The status label indicates whether a doctor is Active or Inactive. An active doctor is marked as currently active in your clinic's records, while an inactive doctor is marked as not currently active. Review the doctor's working arrangement and booking responsibilities before changing their status.",
            },
            {
                title: "Delete a doctor",
                description:
                    "Select the trash icon in the Actions column when a doctor needs to be removed from your clinic's records. Before proceeding, confirm that you selected the correct doctor and consider any existing or upcoming appointments associated with their profile. If the doctor is simply no longer practising at your clinic, consider marking them inactive instead, if that option is available.",
                image: "/images/help/doctors/delete-doctor.webp",
                imageAlt:
                    "Delete action beside a doctor in the doctors table",
            },
        ],
        relatedGuides: [
            {
                title: "Add a new doctor",
                description:
                    "Create a doctor profile and enter their professional details.",
                href: "/help/doctors/add-doctor",
            },
            {
                title: "Edit doctor information",
                description:
                    "Update a doctor's profile and contact information.",
                href: "/help/doctors/edit-doctor",
            },
            {
                title: "Manage doctor schedules",
                description:
                    "Configure doctor availability and working hours.",
                href: "/help/doctors/manage-schedules",
            },
            {
                title: "Manage branches",
                description:
                    "View clinic locations and manage branch information.",
                href: "/help/branches/manage-branches",
            },
        ],
    },

    {
        slug: "doctors/add-doctor",
        title: "Add a new doctor",
        description:
            "Learn how to create a doctor profile, enter professional and contact information, set account status, and assign the doctor to clinic branches.",
        category: "Doctors",
        readTime: "5 min read",
        overviewTitle: "Add doctors to your clinic",
        overview:
            "The Add doctor form lets you register a doctor in Medora by entering their basic profile information, contact details, account status, and branch assignments. You can assign the doctor to one or more clinic branches or leave the assignments empty and configure them later.",
        steps: [
            {
                title: "Open the Doctors page",
                description:
                    "Select Doctors from the sidebar to open your clinic's doctor management page. Select the plus (+) button beside the search field to open the Add doctor form.",
                image: "/images/help/doctors/open-add-doctor.webp",
                imageAlt:
                    "Doctors page with the plus button for adding a doctor",
            },
            {
                title: "Enter the doctor's profile information",
                description:
                    "Under the doctor's basic profile information, enter the doctor's full name and specialty. Both fields are required. Use the doctor's professional name and a clear specialty, such as General Practitioner or Dermatologist, so your team can identify their role.",
                image: "/images/help/doctors/add-doctor-profile.webp",
                imageAlt:
                    "Add doctor form showing the full name and specialty fields",
            },
            {
                title: "Provide contact details",
                description:
                    "Enter the doctor's email address and phone number in the contact fields. Both fields are required. Double-check the information to ensure your clinic has the correct contact details for the doctor.",
            },
            {
                title: "Set the account status",
                description:
                    "Use the Account status dropdown to choose whether the doctor should be Active or Inactive. Select the status that reflects the doctor's current working arrangement with your clinic. Review your clinic's booking workflow before setting a doctor as inactive.",
            },
            {
                title: "Assign the doctor to branches",
                description:
                    "Under Branch assignments, select the checkbox beside each branch where the doctor works. You can select multiple branches if the doctor provides consultations at different locations. If the assignments are not yet known, you can leave this section empty and assign branches later.",
            },
            {
                title: "Review and save the doctor profile",
                description:
                    "Review the doctor's name, specialty, contact details, account status, and selected branches. Select Save to create the doctor profile. If you do not want to proceed, select Cancel to close the form without saving.",
            },
        ],
        relatedGuides: [
            {
                title: "Manage doctors",
                description:
                    "Search for doctors, review their profiles, and manage their status.",
                href: "/help/doctors/manage-doctors",
            },
            {
                title: "Edit doctor information",
                description:
                    "Update a doctor's profile and contact information.",
                href: "/help/doctors/edit-doctor",
            },
            {
                title: "Manage doctor schedules",
                description:
                    "Configure doctor availability and working hours.",
                href: "/help/doctors/manage-schedules",
            },
            {
                title: "Manage branches",
                description:
                    "View clinic locations and manage branch information.",
                href: "/help/branches/manage-branches",
            },
        ],
    },


    {
        slug: "doctors/edit-doctor",
        title: "Edit doctor information",
        description:
            "Learn how to update a doctor's profile, contact details, account status, branch assignments, working hours, and service configurations in Medora.",
        category: "Doctors",
        readTime: "7 min read",
        overviewTitle: "Keep doctor profiles and schedules up to date",
        overview:
            "The doctor details page lets you maintain a doctor's professional information and configure their availability across clinic branches. You can update personal details, change account status, assign branches, define working hours for each location, and select the services the doctor provides. Each branch can have its own working hours and service settings.",
        steps: [
            {
                title: "Open the doctor details page",
                description:
                    "Navigate to Doctors from the sidebar. Find the doctor you want to update and select the edit action to open their profile. Confirm that the doctor's name and specialty match the profile you intend to change.",
                image: "/images/help/doctors/open-edit-doctor.webp",
                imageAlt:
                    "Doctors list with the edit action for opening a doctor's profile",
            },
            {
                title: "Update personal information",
                description:
                    "In the Personal information section, review the doctor's full name, specialty, email address, and phone number. You can also enter or update their PRC license number and short biography if these fields are applicable to your clinic. Make sure the contact information is accurate so your clinic can reach the doctor when necessary.",
                image: "/images/help/doctors/edit-doctor-information.webp",
                imageAlt:
                    "Doctor profile form showing personal information, specialty, contact details, license number, and biography",
            },
            {
                title: "Update the account status",
                description:
                    "Use the Account status dropdown to choose whether the doctor should be Active or Inactive. Keep the doctor active if they are currently practising at your clinic and should remain available for your clinic's workflow. Consider marking the doctor inactive if they have stopped practising at the clinic or should no longer receive new appointments. Before changing the status, review any existing or upcoming appointments and follow your clinic's procedures for handling them.",
            },
            {
                title: "Assign the doctor to clinic branches",
                description:
                    "In the Branch assignments section, enable the branches where the doctor works. Each branch can be configured independently. Select a branch to expand its settings and manage the doctor's working hours and service assignments at that location. Leave a branch disabled if the doctor does not work there.",
                image: "/images/help/doctors/doctor-branch-assignments.webp",
                imageAlt:
                    "Branch assignments section showing enabled and disabled clinic branches",
            },
            {
                title: "Configure working hours for a branch",
                description:
                    "Working hours define the specific days and times when a doctor is available for appointments at a particular branch. In the example, the doctor has two working-hours entries at Cebu Branch: Monday, Wednesday, and Friday from 9:00 AM to 4:00 PM, and Tuesday and Thursday from 8:30 AM to 5:00 PM. This lets you set different schedules for different days and add another entry when a doctor has multiple working periods in one day, such as morning and afternoon sessions separated by a lunch break. Select the applicable days for each entry, then set its start and end times. Only enable the branch if you want to configure its working hours. Make sure the doctor's schedule fits within the branch's opening hours and does not overlap with other unavailable periods.",
                image: "/images/help/doctors/doctor-working-hours.webp",
                imageAlt:
                    "Cebu Branch working-hours configuration showing two schedules with selected weekdays, start and end times, and an option to add another working-hours entry",
            },
            {
                title: "Assign services to the doctor at each branch",
                description:
                    "Services determine which appointments a doctor can provide at each branch, including the applicable price and appointment duration. In the example, General Consultation is enabled with its default price of ₱500 and duration of 30 minutes, while Physical Examination is enabled with a custom price of ₱900 and duration of 50 minutes instead of its default ₱800 and 45 minutes. Follow-up Consultation is not selected, so it is not assigned to the doctor at this branch. Select the services the doctor provides at the location. If a service should use the clinic's default price and duration, leave its override fields empty. If the service needs different pricing or timing at this branch, enter the applicable values in the Rate override and Duration override fields. These settings allow the same doctor to offer different services or charge different rates at different branches.",
                image: "/images/help/doctors/doctor-service-assignments.webp",
                imageAlt:
                    "Cebu Branch service assignments showing General Consultation and Physical Examination selected, Follow-up Consultation unselected, and default and overridden prices and durations",
            },
            {
                title: "Review the branch configuration",
                description:
                    "Before saving, review each enabled branch to confirm that the doctor is assigned to the correct locations, working hours are accurate, and the appropriate services are selected. Check that the doctor's availability is consistent with the branch's opening hours and that any service-specific price or duration overrides are intentional.",
            },
            {
                title: "Save your changes",
                description:
                    "Select Save changes after reviewing the doctor's profile and branch configurations. If you decide not to apply your edits, select Cancel instead. After saving, revisit the doctor's profile to verify that the updated information and assignments are displayed correctly.",
            },
        ],
        relatedGuides: [
            {
                title: "Manage doctors",
                description:
                    "Search for doctors and review their profiles, branch assignments, and statuses.",
                href: "/help/doctors/manage-doctors",
            },
            {
                title: "Add a new doctor",
                description:
                    "Create a doctor profile and configure their initial details.",
                href: "/help/doctors/add-doctor",
            },
            {
                title: "Manage doctor schedules",
                description:
                    "Learn how doctor availability and working hours affect appointment scheduling.",
                href: "/help/doctors/manage-schedules",
            },
            {
                title: "Edit branch details and opening hours",
                description:
                    "Update clinic location details and configure branch opening hours.",
                href: "/help/branches/edit-a-branch",
            },
            {
                title: "Manage services",
                description:
                    "Maintain the services offered by your clinic and their default prices and durations.",
                href: "/help/services/manage-services",
            },
        ],
    },

    {
        slug: "services",
        title: "Manage services",
        description:
            "Learn how to review clinic services, understand service summary cards, search for services, and manage service records using the edit, deactivate, activate, and delete actions.",
        category: "Services",
        readTime: "6 min read",
        overviewTitle: "Manage your clinic's service offerings",
        overview:
            "The Services page lets you manage the services your clinic offers to patients. You can review the total number of services, active services, and average default rate. The services table displays each service's name, default duration, default rate, and status. You can search for a service, edit its details, deactivate or reactivate it, and delete it when appropriate.",
        steps: [
            {
                title: "Open the Services page",
                description:
                    "Select Services from the sidebar to view the services registered in your clinic. The summary cards show the total number of services, how many are active and available for assignment, and the average default rate across all services. These figures help you understand your clinic's current service offerings at a glance.",
                image: "/images/help/services/services-overview.webp",
                imageAlt:
                    "Services page showing summary cards for total services, active services, and average default rate",
            },
            {
                title: "Review service details",
                description:
                    "The All services table displays each service's name, default duration, default rate, and status. For example, General Consultation has a default duration of 30 minutes and a rate of ₱500, while Follow-up Consultation has a default duration of 20 minutes and a rate of ₱350. These are the service's default values. A doctor may have a different price or duration at a particular branch if your clinic configures overrides in the doctor's branch assignments.",
                image: "/images/help/services/services-list.webp",
                imageAlt:
                    "Services table showing service names, default durations, default rates, statuses, and available actions",
            },
            {
                title: "Understand service statuses",
                description:
                    "The status column indicates whether a service is Active or Inactive. Active services are available for assignment to doctors, while inactive services are not available for new assignments. For example, Laboratory Consultation is marked Inactive in the screenshot. Review existing doctor assignments and your clinic's needs before changing a service's status.",
            },
            {
                title: "Add a service",
                description:
                    "Select the + button in the All services section to create a new service for your clinic. Enter the service name, default duration, and default rate in the form, then review the information before saving. For example, you could add Teeth Cleaning with a default duration of 45 minutes and a rate of ₱800. These default values can be used when assigning the service to doctors at different branches. If a doctor needs to charge a different rate or use a different appointment duration at a specific branch, you can configure those overrides in the doctor's branch assignments. Make sure the service details are accurate before saving so your clinic can assign the service appropriately.",
                image: "/images/help/services/add-service.webp",
                imageAlt:
                    "Add service form for entering a service name, default duration, and default rate",
            },
            {
                title: "Edit a service",
                description:
                    "Select the pencil icon in the Actions column to edit a service. Use this when you need to update its name, default duration, default rate, or other editable details shown in the form. Review the changes before saving, especially if doctors already offer this service at one or more branches, because changes to default values may affect how the service is configured elsewhere.",
                image: "/images/help/services/edit-service.webp",
                imageAlt:
                    "Edit action for a service in the Services table",
            },
            {
                title: "Deactivate a service",
                description:
                    "Select the deactivate action, shown as a circle with a diagonal line, when your clinic no longer wants to offer a service for new assignments. For example, you might deactivate a service that has been discontinued. Before doing so, review whether doctors currently provide it and whether appointments have already been scheduled. Deactivation is generally preferable to deletion when you want to stop offering a service while retaining its record.",
                image: "/images/help/services/deactivate-service.webp",
                imageAlt:
                    "Deactivate action beside an active service in the Services table",
            },
            {
                title: "Reactivate a service",
                description:
                    "For an inactive service, use the checkmark action in the Actions column if you want to make it active again. For example, you can reactivate Laboratory Consultation when your clinic resumes offering it. After reactivation, review the service's default duration and rate, then check the relevant doctors' branch assignments to ensure the service is configured correctly.",
                image: "/images/help/services/reactivate-service.webp",
                imageAlt:
                    "Reactivate action beside an inactive service in the Services table",
            },
            {
                title: "Delete a service",
                description:
                    "Select the trash icon when a service needs to be permanently removed from your clinic's service records. Before proceeding, verify that you selected the correct service and consider whether doctors are assigned to it or appointments reference it. If the service may be needed for historical records, reporting, or future use, consider deactivating it instead. Review any confirmation prompt before completing the deletion.",
                image: "/images/help/services/delete-service.webp",
                imageAlt:
                    "Delete action beside a service in the Services table",
            },
        ],
        relatedGuides: [
            {
                title: "Manage doctors",
                description:
                    "Review doctor profiles and their branch assignments.",
                href: "/help/doctors/manage-doctors",
            },
            {
                title: "Edit doctor information",
                description:
                    "Manage branch-specific service assignments and overrides.",
                href: "/help/doctors/edit-doctor",
            },
        ],
    },

    {
        slug: "online-booking",
        title: "How to book an appointment online",
        description:
            "Learn how patients can book an appointment through your clinic's online booking page, from selecting a branch and service to reviewing and submitting their appointment details.",
        category: "Online booking",
        readTime: "8 min read",
        overviewTitle: "Make it easy for patients to book appointments",
        overview:
            "Medora's online booking page guides patients through a step-by-step appointment process without requiring them to create an account. Patients select a clinic branch, choose a service and doctor, pick an available date and time, enter their details, and review their booking before submitting it. The booking summary helps patients check their selections throughout the process.",
        steps: [
            {
                title: "Choose a clinic branch",
                description:
                    "The booking process begins with the Choose a branch page. Patients can review the available clinic locations, including their addresses and opening hours, before selecting the branch that is most convenient for them. Additional information, such as parking and accessibility, may also be displayed. Select a branch to continue to the next step.",
                image: "/images/help/online-booking/choose-branch.webp",
                imageAlt:
                    "Online booking page showing branch cards with addresses, opening hours, and available facilities",
            },
            {
                title: "Select a service",
                description:
                    "After choosing a branch, patients select the service they want to book, such as General Consultation or Follow-up Consultation. Each service may display its description, duration, and price so patients understand what they are booking. The available options depend on the services configured for the selected branch. Choose the appropriate service to continue.",
                image: "/images/help/online-booking/choose-service.webp",
                imageAlt:
                    "Online booking step displaying available clinic services",
            },
            {
                title: "Choose a doctor",
                description:
                    "Patients can select a doctor who provides the chosen service at the selected branch. Review the doctor's name and specialty before making a selection. The available doctors depend on the branch assignments, service assignments, and schedules configured by the clinic. Select a doctor to proceed.",
                image: "/images/help/online-booking/choose-doctor.webp",
                imageAlt:
                    "Online booking step displaying doctors available for the selected service and branch",
            },
            {
                title: "Select a date and time",
                description:
                    "Patients choose a preferred appointment date and an available time slot. Availability is based on the doctor's configured working hours, the selected service's duration, and existing scheduling commitments. For example, if a doctor offers General Consultation appointments lasting 30 minutes, the available slots must accommodate that appointment duration. Select an available slot that fits the patient's schedule.",
                image: "/images/help/online-booking/choose-date-time.webp",
                imageAlt:
                    "Appointment calendar and available time slots for the selected doctor",
            },
            {
                title: "Enter patient details",
                description:
                    "Patients provide the required contact information so the clinic can identify them and communicate about the appointment. Enter the requested details accurately, especially the patient's name, email address, and phone number when those fields are required. No account is required according to the booking page instructions, so patients can provide their details directly without signing up.",
                image: "/images/help/online-booking/patient-details.webp",
                imageAlt:
                    "Online booking form for entering patient contact information",
            },
            {
                title: "Review the appointment details",
                description:
                    "Before submitting the booking, patients review their selections to make sure everything is correct. Check the selected branch, service, doctor, appointment date and time, and patient details. The booking summary on the right side of the page displays the current selections as patients move through the steps. Review the information carefully before proceeding.",
                image: "/images/help/online-booking/review-booking.webp",
                imageAlt:
                    "Appointment review page showing the selected branch, service, doctor, date, time, and patient details",
            },
            {
                title: "Submit the booking request",
                description:
                    "After reviewing the appointment details, submit the booking using the final action displayed on the page. Follow any confirmation message shown after submission. Depending on your clinic's booking workflow, the appointment may require staff approval before it is confirmed. Patients should follow any instructions provided by the clinic after submitting their request.",
                image: "/images/help/online-booking/booking-confirmation.webp",
                imageAlt:
                    "Online booking confirmation screen after submitting an appointment request",
            },
        ],
        relatedGuides: [
            {
                title: "Manage branches",
                description:
                    "Maintain clinic locations and their contact information.",
                href: "/help/branches/manage-branches",
            },
            {
                title: "Edit branch details and opening hours",
                description:
                    "Configure when each clinic location is open to patients.",
                href: "/help/branches/edit-a-branch",
            },
            {
                title: "Manage doctors",
                description:
                    "Maintain doctor profiles and branch assignments.",
                href: "/help/doctors/manage-doctors",
            },
            {
                title: "Edit doctor information",
                description:
                    "Update doctor profiles, working hours, and service assignments.",
                href: "/help/doctors/edit-doctor",
            },
            {
                title: "Manage services",
                description:
                    "Configure clinic services, default durations, and prices.",
                href: "/help/services/manage-services",
            },
            {
                title: "Add a service",
                description:
                    "Create a service that patients can select when booking.",
                href: "/help/services/add-service",
            },
            {
                title: "Manage bookings",
                description:
                    "Review and manage appointment requests in your clinic dashboard.",
                href: "/help/bookings/manage-bookings",
            },
        ],
    },
];
