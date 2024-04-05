"use client";
import PSPDFKit, { Color, Instance, Rect, ToolbarItem } from "pspdfkit";
import { useEffect, useRef, useState } from "react";
import { AnnotationTypeEnum, User } from "../utils/types";
import iconSignature from "@/public/icon-signature.png";
import iconName from "@/public/icon-name.svg";
import iconDate from "@/public/icon-date.svg";
import { twMerge } from "tailwind-merge";
import ImageComponent from "next/image";
import iconPlusGray from "@/public/icon-plus-gray.png";

/**
 * SignDemo component.
 *
 * @param allUsers - An array of User objects representing all the users.
 * @param user - The currently logged-in user.
 * @returns The rendered SignDemo component.
 */
export const SignDemo: React.FC<{ allUsers: User[]; user: User }> = ({
  allUsers,
  user,
}) => {
  //export const SignDemo: any = ({ allUsers, user }: { allUsers: User[], user: User }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [instance, setInstance] = useState<Instance | null>(null);

  // State to store the users. Master is the default user for now who can add fields in the doc.
  const [users, setUser] = useState<User[]>(allUsers);

  const [isVisible, setIsVisible] = useState(
    user.role == "Editor" ? true : false
  );

  // State to store the current signee i.e the user who is currently selected for which the field will be added
  const [currSignee, setCurrSignee] = useState<User>(user);
  const currSigneeRef = useRef(currSignee);
  currSigneeRef.current = currSignee;

  // State to store the current user i.e the user who is currently selected / Loggedin
  const [currUser, setCurrUser] = useState<User>(user);
  const currUserRef = useRef(currUser);
  currUserRef.current = currUser;
  useEffect(() => {
    setCurrUser(user);
    userChange(user);
  }, [user]);

  // State to store the current page index
  const [onPageIndex, setOnPageIndex] = useState<number>(0);
  const onPageIndexRef = useRef(onPageIndex);
  onPageIndexRef.current = onPageIndex;

  function onDragStart(event: React.DragEvent<HTMLDivElement>, type: string) {
    const instantId = PSPDFKit.generateInstantId();
    let data =
      currSignee.name + // value from select, name of signer
      "%" + // % is an invalid email character so we can use it as a delimiter
      currSignee.email + // value from select, email of signer
      "%" +
      instantId +
      "%" +
      type;

    (event.target as HTMLDivElement).style.opacity = "0.8";
    const img = document.getElementById(`${type}-icon`);
    if (img) {
      event.dataTransfer.setDragImage(img, 10, 10);
    }
    event.dataTransfer.setData("text/plain", data);
    event.dataTransfer.dropEffect = "move";
  }

  function onDragEnd(event: React.DragEvent<HTMLDivElement>) {
    (event.target as HTMLDivElement).style.opacity = "1";
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: any, inst: Instance) => {
    e.preventDefault();
    e.stopPropagation();
    const dataArray = e.dataTransfer.getData("text").split("%");
    let [name, email, instantId, annotationType] = dataArray;
    const signee = currSigneeRef.current;
    const user = currUserRef.current;
    const pageIndex = onPageIndexRef.current;
    const clientRect = new PSPDFKit.Geometry.Rect({
      left: e.clientX,
      top: e.clientY,
      height: annotationType === AnnotationTypeEnum.SIGNATURE ? 60 : 40,
      width: 200,
    });
    const pageRect = inst.transformContentClientToPageSpace(
      clientRect,
      pageIndex
    ) as Rect;
    if (annotationType === AnnotationTypeEnum.SIGNATURE) {
      const widget = new PSPDFKit.Annotations.WidgetAnnotation({
        boundingBox: pageRect,
        formFieldName: instantId,
        id: instantId,
        pageIndex,
        name: instantId,
        customData: {
          createdBy: user.id,
          signerID: signee.id,
          signerEmail: email,
          type: annotationType,
          signerColor: signee.color,
        },
        backgroundColor: signee.color,
      });
      const formField = new PSPDFKit.FormFields.SignatureFormField({
        annotationIds: PSPDFKit.Immutable.List([widget.id]),
        name: instantId,
        readOnly: signee.id != user.id,
      });
      await inst.create([widget, formField]);
    } else {
      const text = new PSPDFKit.Annotations.TextAnnotation({
        pageIndex,
        boundingBox: pageRect,
        text: {
          format: "plain",
          value: annotationType === "name" ? name : new Date().toDateString(),
        },
        name: name,
        customData: {
          signerEmail: email,
          type: annotationType,
          signerColor: signee.color,
        },
        font: "Helvetica",
        fontSize: 14,
        horizontalAlign: "center",
        verticalAlign: "center",
        isEditable: true,
        backgroundColor: signee.color,
      });
      await inst.create(text);
    }
    // set the viewer to form creator mode so that the user can place the field
    // inst.setViewState((viewState) =>
    //   viewState.set("interactionMode", PSPDFKit.InteractionMode.FORM_CREATOR)
    // );

    // @ts-ignore
    inst.setOnAnnotationResizeStart((eve) => {
      if (eve.annotation instanceof PSPDFKit.Annotations.WidgetAnnotation) {
        return {
          maintainAspectRatio: true,
          responsive: false,
          maxWidth: 192,
          maxHeight: 80,
        };
      }
    });
  };

  const addSignee = () => {
    const name = window.prompt("Enter signee's name:");
    const email = window.prompt("Enter signee's email:");

    let id = Math.floor(Math.random() * 1000000);
    while (id && users.find((user) => user.id === id)) {
      console.log("Non unique" + id);
      id = Math.floor(Math.random() * 1000000);
    }
    console.log("Unique id" + id);

    if (name && email) {
      setUser((prevState) => [
        ...prevState,
        {
          // You can use your own logic to generate the id
          id: id,
          name: name,
          email: email,
          color: randomColor(),
          role: "signee",
        } as User,
      ]);
    } else {
      alert("Please enter both name and email.");
    }
  };

  // Function to get random color for the signee
  const randomColor = () => {
    const colors: Color[] = [
      PSPDFKit.Color.LIGHT_GREY,
      PSPDFKit.Color.LIGHT_GREEN,
      PSPDFKit.Color.LIGHT_YELLOW,
      PSPDFKit.Color.LIGHT_ORANGE,
      PSPDFKit.Color.LIGHT_RED,
      PSPDFKit.Color.LIGHT_BLUE,
    ];
    const usedColors = users.map((signee) => signee.color);
    const availableColors = colors.filter(
      (color) => !usedColors.includes(color as Color)
    );
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    return availableColors[randomIndex];
  };

  // Function to handle user change
  const userChange = async (user: User) => {
    setCurrUser(user);
    if (instance) {
      const formFields = await instance.getFormFields();
      const signatureFormFields = formFields.filter(
        (field: any) => field instanceof PSPDFKit.FormFields.SignatureFormField
      );
      const signatureAnnotations = async () => {
        let annotations: any[] = [];
        for (let i = 0; i < instance.totalPageCount; i++) {
          let ann = await instance.getAnnotations(i);
          ann.forEach((annotation: any) => {
            if (
              annotation.customData &&
              annotation.customData.signerID == user.id
            ) {
              annotations.push(annotation.id);
            }
          });
        }
        return annotations;
      };
      const userFieldIds = await signatureAnnotations();
      const readOnlyFormFields = signatureFormFields
        .map((it: any) => {
          if (userFieldIds.includes(it.name)) {
            return it.set("readOnly", false);
          } else {
            return it.set("readOnly", true);
          }
        })
        .filter(Boolean); // Filter out undefined values
      await instance.update(readOnlyFormFields);
      // User with role Editor can edit the document
      if (user.role == "Editor") {
        instance.setViewState((viewState) =>
          viewState.set("showToolbar", true)
        );
        setIsVisible(true);
      } else {
        instance.setViewState((viewState) =>
          viewState.set("showToolbar", false)
        );
        setIsVisible(false);
      }
    }
  };

  // Load PSPDFKit
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      if (PSPDFKit) {
        PSPDFKit.unload(container);
      }
      PSPDFKit.load({
        container,
        document: "/document.pdf",
        baseUrl: `${window.location.protocol}//${window.location.host}/`,
        toolbarItems: TOOLBAR_ITEMS as ToolbarItem[],
        disableTextSelection: true,
        electronicSignatures: {
          creationModes: [
            PSPDFKit.ElectronicSignatureCreationMode.DRAW,
            PSPDFKit.ElectronicSignatureCreationMode.IMAGE,
            PSPDFKit.ElectronicSignatureCreationMode.TYPE,
          ],
        },
      }).then((inst: any) => {
        setInstance(inst);
        // Setting Page Index
        inst.addEventListener(
          "viewState.currentPageIndex.change",
          (page: any) => {
            setOnPageIndex(page);
          }
        );
        // Handle Drop event
        const cont = inst.contentDocument.host;
        cont.ondrop = async function (e: any) {
          await handleDrop(e, inst);
        };
      });
    }
  }, []);

  const signeeChanged = (signee: User) => {
    setCurrSignee(signee);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "top",
        }}
      >
        <div style={{ margin: "20px", width: "300px" }}>
          <h2 style={{ margin: "10px" }}>Current user :</h2>
          <select
            className="select bg-anti-flash-white select-ghost w-full !min-h-max !h-8"
            value={currUser.id}
            onChange={(e) =>
              userChange(
                users.find((user) => user.id === Number(e.target.value)) as User
              )
            }
          >
            {users.map((user) => (
              <option
                value={user.id}
                key={user.id}
                className="text-base normal-case leading-55 tracking-02 text-dark-gunmetal"
              >
                {user.name}
              </option>
            ))}
          </select>
          {/* Side panel */}
          {isVisible && (
            <>
              <button
                onClick={addSignee}
                style={{
                  background: "blue",
                  color: "white",
                  borderRadius: "17px",
                  padding: "17px 39px",
                  margin: "29px 0px",
                }}
              >
                Add signee
              </button>
              <h2 style={{ margin: "10px" }}>Select signee : </h2>
              <select
                className="select bg-anti-flash-white select-ghost w-full !min-h-max !h-8"
                value={currSignee.id}
                onChange={(e) =>
                  signeeChanged(
                    users.find(
                      (user) => user.id === Number(e.target.value)
                    ) as User
                  )
                }
              >
                {users.map((signee) => (
                  <option
                    value={signee.id}
                    key={signee.id}
                    className="text-base normal-case leading-55 tracking-02 text-dark-gunmetal"
                  >
                    {signee.name}
                  </option>
                ))}
              </select>
              {/* Uncomment this to add draggable name field */}
              {/* <DraggableAnnotation
                className="mt-5"
                type={AnnotationTypeEnum.NAME}
                label="Name"
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              /> */}
              <DraggableAnnotation
                className="mt-5"
                type={AnnotationTypeEnum.SIGNATURE}
                label="Signature"
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
              {/* Uncomment this to add draggable date field */}
              {/* <DraggableAnnotation
                className="mt-5"
                type={AnnotationTypeEnum.DATE}
                label="Date"
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              /> */}
            </>
          )}
        </div>
        {/* PSPDFKit div */}
        <div
          onDragOver={handleDragOver}
          ref={containerRef}
          style={{ height: "90vh", width: "80%" }}
        />
      </div>
    </div>
  );
};

export default SignDemo;

const DraggableAnnotation = ({
  className,
  type,
  label,
  onDragStart,
  onDragEnd,
}: {
  className: string;
  type: string;
  label: string;
  onDragStart: any;
  onDragEnd: any;
}) => {
  const id = `${type}-icon`;
  let icon = null;
  switch (type) {
    case AnnotationTypeEnum.NAME:
      icon = iconName;
      break;
    case AnnotationTypeEnum.SIGNATURE:
      icon = iconSignature;
      break;
    case AnnotationTypeEnum.DATE:
      icon = iconDate;
      break;
    default:
      icon = iconName;
      break;
  }

  return (
    <div
      className={twMerge(
        "w-full border-0 bg-anti-flash-white rounded-full flex justify-between items-center h-14 px-6 cursor-move",
        className
      )}
      draggable={true}
      onDragStart={(e) => onDragStart(e, type)}
      onDragEnd={(e) => onDragEnd(e, type)}
    >
      <div>
        <ImageComponent
          src={icon}
          width={22}
          className="inline-block mr-5"
          id={id}
          alt={id}
        />
        <span className="text-base normal-case leading-55 tracking-02 text-dark-gunmetal">
          {label}
        </span>
      </div>
      <div>
        <ImageComponent
          src={iconPlusGray}
          width={18}
          className="inline-block"
          alt="plus icon"
        />
      </div>
    </div>
  );
};

export const TOOLBAR_ITEMS = [
  { type: "sidebar-thumbnails" },
  { type: "sidebar-document-outline" },
  { type: "pager" },
  { type: "layout-config" },
  { type: "pan" },
  { type: "zoom-out" },
  { type: "zoom-in" },
  { type: "search" },
  { type: "spacer" },
  { type: "print" },
  { type: "export-pdf" },
];
