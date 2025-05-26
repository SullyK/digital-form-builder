import { FormData, FormSubmissionErrors } from "../types";
import { FormComponent } from "./FormComponent";

import { DataType, ViewModel } from "./types";
import { FileUploadFieldComponent } from "@xgovformbuilder/model";
import { FormModel } from "server/plugins/engine/models";
import joi, { Schema } from "joi";

type FileUploadAttributes = {
  accept: string;
  multiple?: string;
};

export class FileUploadField extends FormComponent {
  dataType = "file" as DataType;
  attributes: FileUploadAttributes = {
    accept: "",
  };
  customAcceptedTypes?: string[];

constructor(def: FileUploadFieldComponent, model: FormModel) {
  super(def, model);

  const { options = {} } = def;
  const formLevelAcceptedTypes = model.def?.uploadServiceOptions?.allowedFileTypes;

  let componentSchema = joi.string().label(def.title.toLowerCase());

  if (options.required === false) {
    componentSchema = componentSchema.allow("").allow(null);
  }

  if (options.multiple) {
    this.attributes.multiple = "multiple";
  }

  const acceptedTypes = formLevelAcceptedTypes?.length
  ? formLevelAcceptedTypes
  : options.accept?.split(",").map((type) => type.trim());

  if (acceptedTypes?.length) {
    this.attributes.accept = acceptedTypes.join(","); 
    this.customAcceptedTypes = acceptedTypes;
  }

  componentSchema = componentSchema.messages({
    "string.empty": "Upload {{#label}}",
  });

  if (options.customValidationMessages) {
      componentSchema = componentSchema.messages(
        options.customValidationMessages
      );
}

  this.schema = componentSchema;
}
  getFormSchemaKeys() {
    return { [this.name]: this.schema as Schema };
  }

  getStateSchemaKeys() {
    return { [this.name]: this.schema as Schema };
  }

  getViewModel(formData: FormData, errors: FormSubmissionErrors) {
    const { options } = this;
    const viewModel: ViewModel = {
      ...super.getViewModel(formData, errors),
      attributes: this.attributes,
    };

    if ("multiple" in options && options.multiple) {
      viewModel.attributes.multiple = "multiple";
    }

    return viewModel;
  }
}
