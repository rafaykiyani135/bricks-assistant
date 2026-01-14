# Customer acquisition tracker
## Overview
The Customer Acquisition Tracking Tool is a lightweight web application designed to centralize and streamline the early stages of a client’s commercial journey. Its primary purpose is to capture essential information about prospective customers—such as contact details, company context, and qualification notes—and to maintain an organized history of all interactions. By logging phone calls, emails, and meetings in a structured manner, the tool helps sales and business development teams maintain continuity and avoid losing track of opportunities.

In addition to storing contact and activity data, the application provides a clear, actionable dashboard that highlights prospects requiring attention. Using simple rules—such as time elapsed since last outreach—the system surfaces leads that may be slipping out of the pipeline. This ensures that teams stay proactive in their follow-up, ultimately improving conversion rates and supporting more predictable customer acquisition workflows.

## Context
### Scope
This application focuses exclusively on the **customer acquisition phase**, covering the period from first contact with a prospective client until their formal qualification or handoff to downstream sales or account-management processes. Its scope is intentionally limited in order to remain simple, fast to deploy, and easy for teams to use as part of their daily workflow.

The tool will support the following capabilities:
-   **Prospect information management:** create, edit, and view basic contact and company details.
-   **Interaction tracking:** record the date, type, and summary of calls, emails, and meetings.
-   **Follow-up monitoring:** identify prospects who have not been contacted recently and surface them on a dedicated dashboard.
-   **Lightweight reporting:** provide at-a-glance visibility into current acquisition activity.

The following areas are **out of scope**: deal and contract management, invoicing, customer onboarding, marketing automation, and integration with external CRMs or communication tools (unless added in future iterations). The product is not intended to replace a full-featured CRM, but rather to offer a focused, minimal solution for early-stage prospect follow-up.

### Domain model
The system revolves around four main entities: **Customer**, **Contact Point**, **Interaction Summary**, and **Employee**.

A **Customer** represents a business or organization that is being targeted during the acquisition phase. Each Customer may have multiple **Contact Points**, which are the individual people within that organization who can be reached for commercial discussions. Contact Points store personal details such as name, role, and communication channels, and they act as the primary anchors for recording interactions.

An **Interaction Summary** captures the substance of a single outreach event—such as a phone call, email, or meeting. Each entry includes a timestamp and a short message describing what occurred. Interaction Summaries are always associated with exactly one **Contact Point**, as well as the **Employee** who initiated or participated in the interaction. This maintains a clear audit trail of engagement history for each prospect.

Finally, **Employee** entities represent internal users of the system responsible for acquisition efforts. By linking interactions to both Contact Points and Employees, the model supports accountability, traceability, and efficient follow-up planning.
