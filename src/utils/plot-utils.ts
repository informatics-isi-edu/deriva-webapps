import { ChaiseError } from '@isrd-isi-edu/chaise/src/models/errors';
import { ChaiseAlertType } from '@isrd-isi-edu/chaise/src/providers/alerts';
import { convertKeysSnakeToCamel } from '@isrd-isi-edu/deriva-webapps/src/utils/string';
// import { UserControlConfig } from '@isrd-isi-edu/deriva-webapps/src/models/plot.ts';


export const validateUID = (userControlData: any, alertFunctions: any, global: boolean = false) => {
  const invalidControlType: string[] = [];
  userControlData.map((control: any, index: number) => {
    if (!control?.uid) {
      throw new ChaiseError('User Control Error', `Missing UID for the specified ${global ? 'global' : 'local'} user control ${control?.label ? `labelled as "${control?.label}"` : `at index ${index}`}.`);
    }
    if (!control?.type) {
      invalidControlType.push(control.uid);
    }
  });
  //Show single error for all uids with same issue
  if (invalidControlType.length > 0) {
    alertFunctions.addAlert(`Unable to display the ${global ? 'global' : 'local'} control with UID(s): ${invalidControlType.join(', ')} as the 'type' was not found for the control.`, ChaiseAlertType.ERROR);
  }
}

export const validateDuplicateControlUID = (userControlData: any, alertFunctions: any, global: boolean = false, plots?: any) => {
  //Validate global controls and plots with same uid. Display error in case of same uid(s)
  const uniqueUidControls: string[] = [];
  let controlObject: any = {};
  //Check if there are any same uid's within global/local controls. If yes. display appropriate error with the repeated uid
  if (userControlData?.length > 0) {
    const dupUid: string[] = [];
    controlObject = userControlData?.reduce((result: any, control: any) => {
      if (!uniqueUidControls?.includes(control.uid)) {
        uniqueUidControls.push(control.uid)
      } else {
        if (!dupUid?.includes(control.uid)) {
          dupUid.push(control.uid);
        }
      }
      result[control.uid] = control;
      return result;
    }, {});
    //Show single error for all uids with same issue
    if (dupUid?.length > 0) {
      dupUid.map((id) => alertFunctions.addAlert(`Multiple ${global ? 'global' : 'local'} controls with the same UID '${id}' were detected.`, ChaiseAlertType.ERROR));
    }
  }
  if (global) {
    const plotObject = validateDuplicatePlotUID(plots, controlObject, uniqueUidControls, alertFunctions);
    return { controlObject, plotObject };
  } else {
    return controlObject;
  }
}

//To check if there are any same uid's between global controls and plots. If yes, display error with the repeated uid
export const validateDuplicatePlotUID = (plots: any, controlObject: any, uniqueUidControls: string[], alertFunctions: any) => {
  const uniqueUidPlots: string[] = [];
  const dupPlotUid: string[] = [];
  const plotObject = plots?.reduce((result: any, plot: any) => {
    if (uniqueUidControls?.includes(plot.uid)) {
      controlObject = Object.keys(controlObject)?.filter((controlKey: string) => controlKey !== plot.uid).reduce((res: any, key) => {
        res[key] = controlObject[key];
        return res;
      }, {});
      alertFunctions.addAlert(`Found a global control and a plot with the same UID '${plot.uid}'.`, ChaiseAlertType.ERROR);
    } else if (uniqueUidPlots?.includes(plot.uid)) {
      if (!dupPlotUid?.includes(plot.uid)) {
        dupPlotUid.push(plot.uid);
      }
    } else {
      uniqueUidPlots.push(plot.uid);
    }
    result[plot.uid] = plot;
    return result;
  }, {});
  //Show single error for all uids with same issue
  if (dupPlotUid?.length > 0) {
    dupPlotUid.map((id) => alertFunctions.addAlert(`Multiple plots with same UID '${id}' were detected.`, ChaiseAlertType.ERROR));
  }
  return plotObject;
}

export const validateControlData = (userControlData: any, alertFunctions: any, global: boolean = false) => {
  // Validate controls for not having neither of the request_info.data nor the request_info.url_pattern and display error
  const invalidControlData: string[] = [];
  const validatedUserControls = userControlData?.map((control: any) => {
    let isControlValid = true;
    if (control.type==='dropdown' && !(control.request_info?.data && control.request_info?.data?.length > 0 || control.request_info?.url_pattern)) {

      isControlValid = false;
      if (!alertFunctions.alerts.some(
        (alert: any) => alert.message.includes(`Unable to display the ${global ? 'global' : 'local'} control with UID '${control.uid}'`))) {
        invalidControlData.push(control.uid);
      }
    }
    return ({ ...control, visible: isControlValid });
  }).filter((control: any) => control.visible || control?.visible == undefined);
  //Show single error for all uids with same issue
  if (invalidControlData?.length > 0) {
    alertFunctions.addAlert(`Unable to display the ${global ? 'global' : 'local'} control with UID(s): ${invalidControlData.join(', ')} because neither the request_info.data nor the request_info.url_pattern were found.`, ChaiseAlertType.WARNING);
  }
  return validatedUserControls;
}

export const validateLayout = (layouts: any, validatedUserControls: any, alertFunctions: any, global: boolean = false) => {
  const mappedLayoutValues = Object.values(layouts)?.map((resLayout: any) => (
    resLayout.map((item: any) => convertKeysSnakeToCamel(({
      // i defines the item on which the given layout will be applied
      i: item?.source_uid,
      ...item,
    })))
  ));
  let tempLayout;
  tempLayout = Object.fromEntries(Object.entries(layouts).map(([key]: any, index) => [key, mappedLayoutValues[index]]));
  const invalidLayoutUid: string[] = [];

  // Check if the layout parameter has all the necessary properties such as source_uid, h, w, x, and y. If any of these properties are missing, display a warning.
  tempLayout = Object.fromEntries(Object.entries(tempLayout).map(([layoutBPKey, layoutBPValue]) => {
    const newValue: any[] = (layoutBPValue as any[]).filter((val: any) => {
      if (!val?.sourceUid) {
        alertFunctions.addAlert(`Unable to display the ${global ? 'global' : 'local'} ${global ? 'component' : 'control'} due to a missing 'source_uid' in layouts parameter for "${layoutBPKey}" breakpoint.`, ChaiseAlertType.WARNING);
        return false;
      }
      //Not showing single error in this case as it's specific to a breakpoint
      if (!(val?.w !== 0 && val?.w !== undefined && val?.h !== 0 && val?.h !== undefined && val?.x !== undefined && val?.y !== undefined)) {
        alertFunctions.addAlert(`Unable to display the ${global ? 'global' : 'local'} ${global ? 'component' : 'control'} with UID "${val.sourceUid}" due to one of the required layout parameters missing(w, h, x, y) for "${layoutBPKey}" breakpoint.`, ChaiseAlertType.WARNING);
        invalidLayoutUid.push(val.sourceUid);
        return false;
      }
      return true;
    });
    return [layoutBPKey, newValue];
  }));

  //Revalidate to filter out controls with invalid layout
  const revalidatedUserControls = validatedUserControls?.map((control: any) => {
    let isControlValid = true;
    if (invalidLayoutUid.includes(control?.uid)) {
      isControlValid = false;
      return ({ ...control, visible: isControlValid });
    }
    return ({ ...control });
  }).filter((control: any) => control.visible || control?.visible == undefined);

  if (global) {
    return { tempLayout, revalidatedUserControls, invalidLayoutUid };
  } else {
    return { tempLayout, revalidatedUserControls };
  }
}