import { useEffect, useState, useRef } from 'react';
import useError from '@isrd-isi-edu/chaise/src/hooks/error';
import { getQueryParams } from '@isrd-isi-edu/chaise/src/utils/uri-utils';
import { ConfigService } from '@isrd-isi-edu/chaise/src/services/config';

export const getDefaultValues = (stageFrom: any[]) => ({
  strength: 'present',
  source: {
    name: ''
  },
  stageFrom: {
    Name: 'TS16',
    Ordinal: 16
  },
  stageTo: {
    Name: 'P110',
    Ordinal: 110
  },
  pattern: '',
  location: '',
  sourceInvalid: false,
  toStageOptions: stageFrom.slice(17)
});

const logObj: any = ConfigService.contextHeaderParams;
export const headerInfo = {
  pid: logObj?.pid,
  cid: logObj?.cid,
  wid: logObj?.wid
};

const baseUrl = window.location.origin;
const specExprUrl = baseUrl + '/ermrest/catalog/2/attributegroup/Gene_Expression:Specimen_Expression';
const devStageUrl = baseUrl + '/ermrest/catalog/2/attribute/Vocabulary:Developmental_Stage';
const sourceUrl = baseUrl + '/ermrest/catalog/2/entity/Vocabulary:Anatomy';
const mouseSpecies = 'NCBITaxon:10090';

const getHeader = () => {
  return {
    wid: headerInfo.wid,
    cid: headerInfo.cid,
    pid: headerInfo.pid,
    catalog: '2',
    action: 'facet'
  };
};
type BooleanData = {
  /**
   * Chaise errors caught during config, fetch and parse
   */
  errors: Array<any>;
  /**
   * Strength Data
   */
  strengthData: Array<any>;
  /**
   * stage Data
   */
  stageFromData: Array<any>;
  /**
   * pattern Data
   */
  patternData: Array<any>;
  /**
   * location Data
   */
  locationData: Array<any>;
}
export const useBooleanData = (): BooleanData => {
  const { dispatchError, errors } = useError();

  const [strengthData, setStrengthData] = useState<any[]>([]);
  const [stageFromData, setStageFromData] = useState<any[]>([]);
  const [patternData, setPatternData] = useState<any[]>([]);
  const [locationData, setLocationData] = useState<any[]>([]);

  const setupStarted = useRef<boolean>(false);

  const fetchMatrixData = async () => {
    try {
      const getPatternOptions = async () => {
        const patternHeaders: any = {};
        const updatedPatternOptions: Array<string> = [];
        patternHeaders[ConfigService.ERMrest.contextHeaderName] = logObj;
        patternHeaders[ConfigService.ERMrest.contextHeaderName] = getHeader();
        patternHeaders[ConfigService.ERMrest.contextHeaderName].schema_table = 'Gene_Expression:Specimen_Expression';
        patternHeaders[ConfigService.ERMrest.contextHeaderName].column = 'Pattern';
        patternHeaders[ConfigService.ERMrest.contextHeaderName].referrer = { schema_table: 'Gene_Expression:Specimen' };
        patternHeaders[ConfigService.ERMrest.contextHeaderName].source =
          [{ 'inbound': ['Gene_Expression', 'Specimen_Expression_Specimen_fkey'] }, 'Pattern'];
        const patternResponse = await ConfigService.http.get(specExprUrl + '/Pattern', { headers: patternHeaders });
        patternResponse.data.forEach(function (el: any) {
          if (el.Pattern == null || el.Pattern == '') {
            return;
          }
          updatedPatternOptions.push(el);
        });
        return updatedPatternOptions;
      };

      const getLocationOptions = async () => {
        const locationHeaders: any = {};
        const updatedLocationOptions: Array<string> = [];
        locationHeaders[ConfigService.ERMrest.contextHeaderName] = getHeader();
        locationHeaders[ConfigService.ERMrest.contextHeaderName].schema_table = 'Gene_Expression:Specimen_Expression';
        locationHeaders[ConfigService.ERMrest.contextHeaderName].column = 'Pattern_Location';
        locationHeaders[ConfigService.ERMrest.contextHeaderName].referrer = { schema_table: 'Gene_Expression:Specimen' };
        const locationResponse = await ConfigService.http.get(specExprUrl + '/Pattern_Location', { headers: locationHeaders });
        locationResponse.data.forEach(function (el: any) {
          if (el.Pattern_Location === null || el.Pattern_Location == '') {
            return;
          }
          updatedLocationOptions.push(el);
        });
        return updatedLocationOptions;
      };

      const getStageOptions = async () => {
        const stageHeaders: any = {};
        const fromStageOptions: any = [];
        stageHeaders[ConfigService.ERMrest.contextHeaderName] = getHeader();
        stageHeaders[ConfigService.ERMrest.contextHeaderName].schema_table = 'Vocabulary:Developmental_Stage';
        stageHeaders[ConfigService.ERMrest.contextHeaderName].referrer = { 'schema_table': 'Gene_Expression:Specimen' };
        stageHeaders[ConfigService.ERMrest.contextHeaderName].source =
          [{ 'outbound': ['Gene_Expression', 'Specimen_Developmental_Stage_fkey'] }, 'RID'];
        const stageResponse = await ConfigService.http.get(devStageUrl + '/Species='
        + encodeURIComponent(mouseSpecies) + '/Name,Ordinal@Sort(Ordinal)', { headers: stageHeaders });
        stageResponse.data.forEach(function (el: any) {
          fromStageOptions.push({
            'Name': el.Name,
            'Ordinal': el.Ordinal
          });
        });
        return fromStageOptions;
      };

      const getStrengthOptions = async () => {
        const headers: any = {};
        const updatedStrengthOptions: Array<string> = [];
        headers[ConfigService.ERMrest.contextHeaderName] = logObj;
        headers[ConfigService.ERMrest.contextHeaderName] = getHeader();
        headers[ConfigService.ERMrest.contextHeaderName].schema_table = 'Gene_Expression:Specimen_Expression';
        headers[ConfigService.ERMrest.contextHeaderName].column = 'Strength';
        headers[ConfigService.ERMrest.contextHeaderName].referrer = { schema_table: 'Gene_Expression:Specimen' };
        headers[ConfigService.ERMrest.contextHeaderName].source =
          [{ 'inbound': ['Gene_Expression', 'Specimen_Expression_Specimen_fkey'] }, 'Strength'];

        let pcid = getQueryParams(window.location.href).pcid;
        let ppid = getQueryParams(window.location.href).ppid;

        if (pcid) {
          headers[ConfigService.ERMrest.contextHeaderName].pcid = pcid;
        }
        if (ppid) {
          headers[ConfigService.ERMrest.contextHeaderName].ppid = ppid;
        }
        const strengthResponse = await ConfigService.http.get(specExprUrl + '/Strength', { headers: headers });
        strengthResponse.data.forEach(function (el: any) {
          if (el.Strength == null || el.Strength == '') {
            return;
          }
          updatedStrengthOptions.push(el);
        });
        return updatedStrengthOptions;
      };

      const [patternOptions, strengthOptions, locationOptions, stageOptions] = await Promise.all([
        getPatternOptions(),
        getStrengthOptions(),
        getLocationOptions(),
        getStageOptions()
      ]);

      setStrengthData(strengthOptions);
      setStageFromData(stageOptions);
      setPatternData(patternOptions);
      setLocationData(locationOptions);
    } catch (error) {
      dispatchError({ error });
    }
  };

  useEffect(() => {
    if (setupStarted.current) return;
    setupStarted.current = true;
    fetchMatrixData();
  }, []);

  return {
    errors,
    strengthData,
    stageFromData,
    patternData,
    locationData
  };
};

export const getSourceOptions = async (sources: any[]) => {
  const sourceHeaders: any = {};
  sourceHeaders[ConfigService.ERMrest.contextHeaderName] = getHeader();
  sourceHeaders[ConfigService.ERMrest.contextHeaderName].schema_table = 'Vocabulary:Anatomy';
  sourceHeaders[ConfigService.ERMrest.contextHeaderName].referrer = { schema_table: 'Gene_Expression:Specimen' };
  sourceHeaders[ConfigService.ERMrest.contextHeaderName].source = [{ 'inbound': ['Gene_Expression', 'Specimen_Expression_Specimen_fkey'] },
  { 'inbound': ['Gene_Expression', 'Specimen_Expression_Rollup_Specimen_Expression_RID1'] },
  { 'outbound': ['Gene_Expression', 'Specimen_Expression_Rollup_Rollup_Region1'] }, 'RID'];
  const columnName = 'Name=';
  let queryParam = '/' + columnName + encodeURIComponent(sources[0]);
  for (let i = 1; i < sources.length; i++) {
    queryParam += (';' + columnName + encodeURIComponent(sources[i]));
  }

  const sourceResponse = await ConfigService.http.get(sourceUrl + queryParam, { headers: sourceHeaders });
  return sourceResponse.data;
};
