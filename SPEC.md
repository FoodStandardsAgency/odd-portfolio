# Portfolio

## Overview
The aim is to build an online tool to help teams across ODD see at glance what projects are being worked on and what their status is and secondly, to see and document progress made and track delivery.
It needs to be easily accessible online and hosted within our IT environment and provide as seamless experience as possible in terms of using the overview screens, viewing project details and updating the information. 
The tool needs to be branded using standard FSA’s colour scheme and logos.

## Summary views
There needs to be an ‘overview’ template – which shows all the projects grouped in chosen categories, and sorted by priority in each category. Initially, these categories will be: 

* status, 
* category, 
* RAG, 
* priority. 

The status counters on the top of each summary view are interactive. When clicked a list of all projects with the given status is displayed. For ‘Priority’ view to be manageable we are to aggregating scores into fewer categories at the app level.

There also needs to be a 'filter view', enabling users to select filter projects by multiple criteria.

There is also an extra view showing a list of completed projects.

## Project view
For projects, there need to be a project template, showing more details about individual project. These include: 
* description, 
* status, 
* related projects,
* category & subcategory, 
* ODD lead with their contact details, 
* written update from the project lead (with history), 
* RAG, 
* priority group,
* project id,
* project team,
* and conditionally, the link to update the data.


## Project data management
There are 3 forms to help manage the project data.

Forms available only to the Portfolio team:
* [Add project](http://oddportfolio.food.gov.uk/portfolio-add)
* Update project

Forms available to the ODD lead teams and Portfolio team:
* Update project

The difference between ODD and Portfolio teams's update forms is the level of detail. The Portfolio team can update any detail of the project, while the ODD lead form is more concise and only the fields updated often are displayed.
The links to the Update form are displayed in the top-right corner of each project view. Portfolio or ODD form will be served depending on which user is logged in.

Portfolio team also has the ability add updates in bulk.

Other FSA users are only able to view the projects.

## User control
At the moment, individual user accounts are not supported. We have only 3 'user groups', which shared passwords. These groups are:
* FSA wide
* ODD leads
* Portfolio team

The FSA user can only view the project information. The ODD leads and Portfolio team have access to add and/or update projects.

## Database
The app uses postgres db. All projects data is saved in the projects table. This table contains the history of updates for each project and provides audit trail. The latest_projects view is used in majority of queries in the app.
