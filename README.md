Signing Demo

Overview

The Signing Demo project showcases the core functionalities of PSPDFKit’s Web SDK for various document signing workflows. Built using Next.js (v14.1.4) and PSPDFKit (v2024.2.0), this project provides a practical demonstration of document signing capabilities.

Getting Started

To get started with the Signing Demo project, follow these steps:

1. Clone the repository from the GitHub repository at [https://github.com/Siddharth2001-July/pspdfkit-demo].
2. Open a terminal and navigate to the project directory.
3. Run npm i to install the project dependencies.
4. Copy the PSPDFKit for Web library assets to the public directory by running:
cp -R ./node_modules/pspdfkit/dist/pspdfkit-lib public/pspdfkit-lib
5. You should now be able to run the project locally by executing npm run dev.

Explanation

File Structure

signingDemo.tsx: Contains the main logic of the Signing Demo project where PSPDFKit SDK is utilized to demonstrate signing capabilities.
page.tsx: Utilizes the reusable component `SignDemo` to mimic the actual signing workflow.

Components

SignDemo: A reusable component responsible for rendering the signing interface. This component relies on the PSPDFKit SDK to enable signing functionalities.

Properties
allUsers: An array of type `User` containing all the users involved in the document signing process.
user: An object of type `User` representing the currently logged-in user.
User (Interface):
role: Specifies the role of the user. Users with the role of `Editor` possess capabilities to add new signing fields, additional signers, etc.
id: Specifies the unique id of user.
name: Specifies the name of the user.
email: Specifies the email of the user.

Note

Currently, there is no integration with a database to store the state of the signing process, keeping the project simple and reusable.

Conclusion

The Signing Demo project offers a practical demonstration of PSPDFKit’s Web SDK for document signing workflows. By following the steps outlined in the documentation, users can quickly set up and explore the functionalities provided by the PSPDFKit.
