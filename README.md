# Project Title - Web Assignment

This project can be used for some need to use images and texts to exchange relevant information with agents. This information is provided in the form of chats, images and annotations, and different agents can obtain the desired content through the synchronization of the information.

# Getting Started 

Technologies about socket.io, service worker, nodeJS, MongoDB, IndexedDb, Ajax and others are used in the project.

## Install npm

```
$ npm install npm@latest -g
```

## Install nodeJS

```
$ apt-get install nodejs npm   #npm
```

## Install MongoDB

```
$ npm install mongodb   #npm
```

## Install indexedDB

```
$ npm i use-indexeddb    # npm 
```

# Prerequisites

Make sure you have installed all of the following prerequisites on your developer computer:

- Git - [Download & Install Git](https://desktop.github.com/). OSX and Linux machines typically have this already installed.
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager. If you encounter any problems, you can also use this [GitHub Gist](https://gist.github.com/isaacs/579814) to install Node.js.
- MongoDB - [Download & Install MongoDB](http://www.mongodb.org/downloads), and make sure it's running on the default port .
- IndexedDB - Use [Indexed BD](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API/Using_IndexedDB) to ensure that the cache function enables offline and online functions .

# File directory description

```
filetree 
├── Readme.md
├── /.idea/
│  ├── /copyright/
│  ├── /inspectionProfiles/
│  ├── /runConfigurations/
│  ├── .gitignore
│  ├── .name
│  ├── Week 3.c Socket.io chat.iml
│  ├── compiler.xml
│  ├── jsLibraryMappings.xml
│  ├── misc.xml
│  ├── modules.xml
│  ├── uiDesigner.xml
│  └── vcs.xml
├── /bin/
│  ├── www
├── /controllers/
│  ├── characters.js
│  └── init.js
├── /database/
│  └── characters.js
├── /moudles/
│  └── characters.js
├── /node_modules/
│  ├──.package-lock.json
│  ├──...
├── public
│  ├──/images/
│  ├──/javascripts/
│  │  ├──/idb/
│  │  │  ├──index.js
│  │  │  └──wrap-idb-value.js
│  │  ├──canvas.js
│  │  ├──database.js
│  │  └──index.js
│  ├──/stylesheets/
│  └──.DS_Store
├── routes
│  ├──index.js
│  └──users.js
├── socket.io
│  └──socket-io.js
├── swagger
│  └──swaggerDocumentation.json
├── views
│  ├──error.ejs
│  └──index.ejs
├── .DS_Store
├── Week 3.c Socket.io chat.iml
├── app.js
├── package.json
└──  package-lock.json
```

# Development environment

|                     |        Name         |   Version    |
| :-----------------: | :-----------------: | :----------: |
|    **platform**     |    IntelliJ IDEA    | 2020.3.2 x64 |
| **computer system** |       Windows       | Win8.1/Win10 |
|    **language**     | HTML_CSS_Javascript |      \       |

------

# Contribution

| Name          | Division of labor                        | Percentage |
| ------------- | ---------------------------------------- | ---------- |
| Nanxiang Wang | IndexedDb, Ajax communication, Swagger documentation | 33.3%      |
| Xinmeng Yang  | service worker, MongoDB                  | 33.3%      |
| Zhiyang Li    | socket.io, nodeJS server, the chat/annotation interface | 33.3%      |

Please read CONTRIBUTING for details on our code of conduct, and the process for submitting pull requests to us.

# Features

## Web application

●Take pictures and upload pictures;

●The image is associated with the title, description and the name of the author.

●You can list images by author's name, and then click to select one of them for annotation. 

●Users can view all images of all other users;Upload the picture to the page. 

​	Then use Ajax to send the image to the database. Data is exchanged using JSON. Use base 64 format to upload images. The image is uploaded to the MongoDB database.

## Chat and annotation interface

●The user selects the image and enters the chat room

​	○Display the image to be annotated
​	○Chat
​	○The mouse to annotate images.

​	Use socket.io to send chat text and graphical annotations to participants in the meeting room.
Annotations are sent and received in real time.
The interface must allow moving to other images while remaining connected.

## Local persistence

​	Participants in the chat save the annotations and chat texts in the local IndexedDB database. They can be cached:

●The actual image (stored in IndexedDB in base64 format) and its URL or ID are in the database.

●Annotation and chat content

● Any conversion to another image URL

​	When the user returns to the image they have annotated, all the above information will be displayed in the cache. Work offline Web applications can still annotate, and allow online and offline annotations.

​	When uploading a new picture, if the device is offline, the picture will be cached in IndexedDB.
When the device is online again, the image is uploaded to the server's database via Ajax.
​	Comments from previous chats will be saved in indexedDB and displayed when a specific image URL is requested, even when offline.

​	You can make comments while offline, but the comments will not be shared with anyone.

## Knowledge Graph

When the user accesses the image again, this information will be cached and displayed.
Comments are also cached in IndexedDB so that they can be used online and offline.
The information is stored in the original JSON-LD format and is not updated.

# Github repository address

https://github.com/Intelligent-web-group

The private repository will be share to designated users in accordance with the requirements of the assignment.

# Release History 

Version: 0.1.0

Time: 26/03/21

Operation: Update IndexedDB, socket.io, Ajax, Swagger, NodeJS;

Version: 0.2.0

CHANGE: Update MongoDB, service worker, knowledge graph;

Time: 21/05/21

# Git Commits report

![Commits · Intelligent-web-group_web-assignment_0](Commits · Intelligent-web-group_web-assignment_0.jpg)

# Authors 

Nanxiang Wang - nwang35@sheffield.ac.uk

Xingmeng Yang - xyang96@sheffield.ac.uk

Zhiyang Li - zli207@sheffield.ac.uk

# Thanks

Prof. Fabio Ciravegna

All staffs of COM6504 The Intelligent Web

[GitHub Pages](https://pages.github.com/)

