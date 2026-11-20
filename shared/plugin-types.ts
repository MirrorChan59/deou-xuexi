// ---- plugin:feishu_bitable_interview_question_read_1 ----
// ============================================================
// 插件 feishu_bitable_interview_question_read_1 (面试题库表读取实例) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export type FeishuBitableInterviewQuestionReadOneAggregatequeryInput = {
  pageSize?: number;
  sort?: {
    fieldName: string;
    desc?: boolean;
  }[];
  filter?: {
    conjunction?: string;
    conditions?: {
      fieldName: string;
      operator: string;
      value?: string[];
    }[];
  };
  expandArrayDimension?: boolean;
  dimensions?: string[];
  measures?: {
    alias?: string;
    fieldName: string;
    aggregation: string;
  }[];
  pageToken?: string;
};

/**
 * const input: FeishuBitableInterviewQuestionReadOneAggregatequeryInput = { pageSize, sort, filter, ... };
 * capabilityClient.load('feishu_bitable_interview_question_read_1').call<FeishuBitableInterviewQuestionReadOneAggregatequeryOutput>('aggregateQuery', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { result, hasMore, pageToken } = result;
 * 返回值形如：
 *   {"result":[{}],"hasMore":false,"pageToken":"示例文本"}
 */
export type FeishuBitableInterviewQuestionReadOneAggregatequeryOutput = {
  result: {

  }[];
  hasMore: boolean;
  pageToken?: string;
};

export type FeishuBitableInterviewQuestionReadOneBatchaddrecordsInput = {
  records: {
    record: {

    };
  }[];
};

/**
 * const input: FeishuBitableInterviewQuestionReadOneBatchaddrecordsInput = { records };
 * capabilityClient.load('feishu_bitable_interview_question_read_1').call<FeishuBitableInterviewQuestionReadOneBatchaddrecordsOutput>('batchAddRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export type FeishuBitableInterviewQuestionReadOneBatchaddrecordsOutput = {
  records: {
    id: string;
  }[];
};

export type FeishuBitableInterviewQuestionReadOneBatchupdaterecordsInput = {
  records: {
    id: string;
    record: {

    };
  }[];
};

/**
 * const input: FeishuBitableInterviewQuestionReadOneBatchupdaterecordsInput = { records };
 * capabilityClient.load('feishu_bitable_interview_question_read_1').call<FeishuBitableInterviewQuestionReadOneBatchupdaterecordsOutput>('batchUpdateRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export type FeishuBitableInterviewQuestionReadOneBatchupdaterecordsOutput = {
  records: {
    id: string;
  }[];
};

export type FeishuBitableInterviewQuestionReadOneDeleterecordsInput = {
  recordIDs: string[];
};

/**
 * const input: FeishuBitableInterviewQuestionReadOneDeleterecordsInput = { recordIDs };
 * capabilityClient.load('feishu_bitable_interview_question_read_1').call<FeishuBitableInterviewQuestionReadOneDeleterecordsOutput>('deleteRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { success } = result;
 * 返回值形如：
 *   {"success":false}
 */
export type FeishuBitableInterviewQuestionReadOneDeleterecordsOutput = {
  success: boolean;
};

export type FeishuBitableInterviewQuestionReadOneGetrecordInput = {
  recordID: string;
};

/**
 * const input: FeishuBitableInterviewQuestionReadOneGetrecordInput = { recordID };
 * capabilityClient.load('feishu_bitable_interview_question_read_1').call<FeishuBitableInterviewQuestionReadOneGetrecordOutput>('getRecord', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { id, record } = result;
 * 返回值形如：
 *   {"id":"示例文本","record":{"题目":{"text":"示例文本"},"职能":"示例文本","分类":null,"难度":"示例文本","参考答案":null,"特征标签":null}}
 */
export type FeishuBitableInterviewQuestionReadOneGetrecordOutput = {
  id: string;
  record?: {
    '题目'?: {
      text: string;
    };
    '职能'?: string;
    '分类'?: unknown;
    '难度'?: string;
    '参考答案'?: unknown;
    '特征标签'?: unknown;
  };
};

export type FeishuBitableInterviewQuestionReadOneSearchrecordsInput = {
  pageToken?: string;
  pageSize?: number;
  fieldNames?: string[];
  sort?: {
    fieldName: string;
    desc?: boolean;
  }[];
  filter?: {
    conjunction?: string;
    conditions?: {
      fieldName: string;
      operator: string;
      value?: string[];
    }[];
  };
};

/**
 * const input: FeishuBitableInterviewQuestionReadOneSearchrecordsInput = { pageToken, pageSize, fieldNames, ... };
 * capabilityClient.load('feishu_bitable_interview_question_read_1').call<FeishuBitableInterviewQuestionReadOneSearchrecordsOutput>('searchRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { hasMore, pageToken, total, ... } = result;
 * 返回值形如：
 *   {"hasMore":false,"pageToken":"示例文本","total":0,"records":[{"id":"示例文本","record":{"题目":{},"职能":"示例文本","分类":null,"难度":"示例文本","参考答案":null,"特征标签":null}}]}
 */
export type FeishuBitableInterviewQuestionReadOneSearchrecordsOutput = {
  hasMore: boolean;
  pageToken?: string;
  total?: number;
  records: {
    id: string;
    record: {
      '题目'?: {
        text: string;
      };
      '职能'?: string;
      '分类'?: unknown;
      '难度'?: string;
      '参考答案'?: unknown;
      '特征标签'?: unknown;
    };
  }[];
};
// ---- end:feishu_bitable_interview_question_read_1 ----

// ---- plugin:read_campus_recruitment_application_table_1 ----
// ============================================================
// 插件 read_campus_recruitment_application_table_1 (读取校招投递表数据) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface ReadCampusRecruitmentApplicationTableOneAggregatequeryInput {
  /** [object Object] */
  pageSize?: number;
  /** [object Object] */
  sort?: {
    fieldName: string;
    desc: boolean;
  }[];
  /** [object Object] */
  filter?: {
    conjunction: string;
    conditions: {
      fieldName: string;
      operator: string;
      value: string[];
    }[];
  };
  /** [object Object] */
  expandArrayDimension?: boolean;
  /** [object Object] */
  dimensions?: string[];
  /** [object Object] */
  measures?: {
    fieldName: string;
    aggregation: string;
    alias: string;
  }[];
  /** [object Object] */
  pageToken?: string;
}

/**
 * capabilityClient.load('read_campus_recruitment_application_table_1').call<ReadCampusRecruitmentApplicationTableOneAggregatequeryOutput>('aggregateQuery', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { result, hasMore, pageToken } = result;
 * 返回值形如：
 *   {"result":[{}],"hasMore":false,"pageToken":"示例文本"}
 */
export interface ReadCampusRecruitmentApplicationTableOneAggregatequeryOutput {
  /** [object Object] */
  result: {

  }[];
  /** [object Object] */
  hasMore: boolean;
  /** [object Object] */
  pageToken?: string;
}

export interface ReadCampusRecruitmentApplicationTableOneBatchaddrecordsInput {
  /** [object Object] */
  records: {
    record: {

    };
  }[];
}

/**
 * capabilityClient.load('read_campus_recruitment_application_table_1').call<ReadCampusRecruitmentApplicationTableOneBatchaddrecordsOutput>('batchAddRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface ReadCampusRecruitmentApplicationTableOneBatchaddrecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface ReadCampusRecruitmentApplicationTableOneBatchupdaterecordsInput {
  /** [object Object] */
  records: {
    id: string;
    record: {

    };
  }[];
}

/**
 * capabilityClient.load('read_campus_recruitment_application_table_1').call<ReadCampusRecruitmentApplicationTableOneBatchupdaterecordsOutput>('batchUpdateRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export interface ReadCampusRecruitmentApplicationTableOneBatchupdaterecordsOutput {
  /** [object Object] */
  records: {
    id: string;
  }[];
}

export interface ReadCampusRecruitmentApplicationTableOneDeleterecordsInput {
  /** [object Object] */
  recordIDs: string[];
}

/**
 * capabilityClient.load('read_campus_recruitment_application_table_1').call<ReadCampusRecruitmentApplicationTableOneDeleterecordsOutput>('deleteRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { success } = result;
 * 返回值形如：
 *   {"success":false}
 */
export interface ReadCampusRecruitmentApplicationTableOneDeleterecordsOutput {
  /** [object Object] */
  success: boolean;
}

export interface ReadCampusRecruitmentApplicationTableOneGetrecordInput {
  /** [object Object] */
  recordID: string;
}

/**
 * capabilityClient.load('read_campus_recruitment_application_table_1').call<ReadCampusRecruitmentApplicationTableOneGetrecordOutput>('getRecord', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { id, record } = result;
 * 返回值形如：
 *   {"id":"示例文本","record":{"公司":{"text":"示例文本"},"岗位":null,"职能":"示例文本","招聘对象":"示例文本","投递链接":{"text":"示例文本","link":"示例文本"},"备注":null,"创建时间":0,"工作城市":"示例文本","投递开始日期":0,"投递截止日期":0,"内推人/内推码":null,"更新时间":0}}
 */
export interface ReadCampusRecruitmentApplicationTableOneGetrecordOutput {
  /** [object Object] */
  id: string;
  /** [object Object] */
  record?: {
    '公司': {
      text: string;
    };
    '岗位': unknown;
    '职能': string;
    '招聘对象': string;
    '投递链接': {
      text: string;
      link: string;
    };
    '备注': unknown;
    '创建时间': number;
    '工作城市': string;
    '投递开始日期': number;
    '投递截止日期': number;
    '内推人/内推码': unknown;
    '更新时间': number;
  };
}

export interface ReadCampusRecruitmentApplicationTableOneSearchrecordsInput {
  /** [object Object] */
  fieldNames?: string[];
  /** [object Object] */
  sort?: {
    fieldName: string;
    desc: boolean;
  }[];
  /** [object Object] */
  filter?: {
    conditions: {
      operator: string;
      value: string[];
      fieldName: string;
    }[];
    conjunction: string;
  };
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  pageSize?: number;
}

/**
 * capabilityClient.load('read_campus_recruitment_application_table_1').call<ReadCampusRecruitmentApplicationTableOneSearchrecordsOutput>('searchRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records, hasMore, pageToken, ... } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本","record":{"岗位":null,"招聘对象":"示例文本","投递截止日期":0,"投递链接":{},"备注":null,"创建时间":0,"更新时间":0,"公司":{},"职能":"示例文本","工作城市":"示例文本","投递开始日期":0,"内推人/内推码":null}}],"hasMore":false,"pageToken":"示例文本","total":0}
 */
export interface ReadCampusRecruitmentApplicationTableOneSearchrecordsOutput {
  /** [object Object] */
  records: {
    id: string;
    record: {
      '岗位': unknown;
      '招聘对象': string;
      '投递截止日期': number;
      '投递链接': {
        text: string;
        link: string;
      };
      '备注': unknown;
      '创建时间': number;
      '更新时间': number;
      '公司': {
        text: string;
      };
      '职能': string;
      '工作城市': string;
      '投递开始日期': number;
      '内推人/内推码': unknown;
    };
  }[];
  /** [object Object] */
  hasMore: boolean;
  /** [object Object] */
  pageToken?: string;
  /** [object Object] */
  total?: number;
}
// ---- end:read_campus_recruitment_application_table_1 ----

// ---- plugin:interview_answer_scoring ----
// ============================================================
// 插件 interview_answer_scoring (面试回答AI评分) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export type InterviewAnswerScoringInput = {
  /** 面试题目 */
  interview_question: string;
  /** 参考答案 */
  reference_answer: string;
  /** 求职者回答 */
  candidate_answer: string;
};

/**
 * const input: InterviewAnswerScoringInput = { interview_question, reference_answer, candidate_answer };
 * capabilityClient.load('interview_answer_scoring').call<InterviewAnswerScoringOutput>('textToJson', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { highlight, totalScore, missingPoints, ... } = result;
 * 返回值形如：
 *   {"highlight":0,"totalScore":0,"missingPoints":[],"overallComment":"示例文本","structure":0,"specificity":0,"percentScore":0,"improvementSuggestions":[],"coverage":0,"logic":0}
 */
export type InterviewAnswerScoringOutput = {
  /** 差异化亮点 0-10 分，评估是否有独特见解或超出参考答案的深度 */
  highlight: number;
  /** 五个维度直接相加的总分，满分 50 */
  totalScore: number;
  /** 遗漏的核心要点列表，元素为字符串，每条一句话说明参考答案中提到但回答未覆盖的要点，可为空数组 */
  missingPoints: unknown[];
  /** 80 字以内的总体点评 */
  overallComment: string;
  /** 结构完整性 0-10 分，评估回答是否有清晰结构框架（如 STAR、总分总） */
  structure: number;
  /** 具体性 0-10 分，评估是否有具体案例、数据、场景支撑 */
  specificity: number;
  /** 百分制分数，等于 totalScore 乘以 2，满分 100 */
  percentScore: number;
  /** 具体可执行的改进建议列表，元素为字符串，每条一句话包含具体动作，至少 1 条 */
  improvementSuggestions: unknown[];
  /** 要点覆盖度 0-10 分，评估是否覆盖参考答案核心要点 */
  coverage: number;
  /** 逻辑清晰度 0-10 分，评估表达条理与因果是否明确 */
  logic: number;
};
// ---- end:interview_answer_scoring ----

// ---- plugin:feishu_bitable_user_list_read_1 ----
// ============================================================
// 插件 feishu_bitable_user_list_read_1 (面试学员用户表读取实例) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export type FeishuBitableUserListReadOneAggregatequeryInput = {
  sort?: {
    fieldName: string;
    desc?: boolean;
  }[];
  filter?: {
    conjunction?: string;
    conditions?: {
      operator: string;
      value?: string[];
      fieldName: string;
    }[];
  };
  expandArrayDimension?: boolean;
  dimensions?: string[];
  measures?: {
    fieldName: string;
    aggregation: string;
    alias?: string;
  }[];
  pageToken?: string;
  pageSize?: number;
};

/**
 * const input: FeishuBitableUserListReadOneAggregatequeryInput = { sort, filter, expandArrayDimension, ... };
 * capabilityClient.load('feishu_bitable_user_list_read_1').call<FeishuBitableUserListReadOneAggregatequeryOutput>('aggregateQuery', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { result, hasMore, pageToken } = result;
 * 返回值形如：
 *   {"result":[{}],"hasMore":false,"pageToken":"示例文本"}
 */
export type FeishuBitableUserListReadOneAggregatequeryOutput = {
  result: {

  }[];
  hasMore: boolean;
  pageToken?: string;
};

export type FeishuBitableUserListReadOneBatchaddrecordsInput = {
  records: {
    record: {
      '用户名'?: string;
      '密码'?: string;
      '角色'?: string;
      '状态'?: string;
      '创建时间'?: number;
    };
  }[];
};

/**
 * const input: FeishuBitableUserListReadOneBatchaddrecordsInput = { records };
 * capabilityClient.load('feishu_bitable_user_list_read_1').call<FeishuBitableUserListReadOneBatchaddrecordsOutput>('batchAddRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export type FeishuBitableUserListReadOneBatchaddrecordsOutput = {
  records: {
    id: string;
  }[];
};

export type FeishuBitableUserListReadOneBatchupdaterecordsInput = {
  records: {
    id: string;
    record: {
      '用户名'?: string;
      '密码'?: string;
      '角色'?: string;
      '状态'?: string;
      '创建时间'?: number;
    };
  }[];
};

/**
 * const input: FeishuBitableUserListReadOneBatchupdaterecordsInput = { records };
 * capabilityClient.load('feishu_bitable_user_list_read_1').call<FeishuBitableUserListReadOneBatchupdaterecordsOutput>('batchUpdateRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本"}]}
 */
export type FeishuBitableUserListReadOneBatchupdaterecordsOutput = {
  records: {
    id: string;
  }[];
};

export type FeishuBitableUserListReadOneDeleterecordsInput = {
  recordIDs: string[];
};

/**
 * const input: FeishuBitableUserListReadOneDeleterecordsInput = { recordIDs };
 * capabilityClient.load('feishu_bitable_user_list_read_1').call<FeishuBitableUserListReadOneDeleterecordsOutput>('deleteRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { success } = result;
 * 返回值形如：
 *   {"success":false}
 */
export type FeishuBitableUserListReadOneDeleterecordsOutput = {
  success: boolean;
};

export type FeishuBitableUserListReadOneGetrecordInput = {
  recordID: string;
};

/**
 * const input: FeishuBitableUserListReadOneGetrecordInput = { recordID };
 * capabilityClient.load('feishu_bitable_user_list_read_1').call<FeishuBitableUserListReadOneGetrecordOutput>('getRecord', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { id, record } = result;
 * 返回值形如：
 *   {"id":"示例文本","record":{"密码":null,"角色":"示例文本","状态":"示例文本","创建时间":0,"用户名":{"text":"示例文本"}}}
 */
export type FeishuBitableUserListReadOneGetrecordOutput = {
  id: string;
  record?: {
    '密码'?: unknown;
    '角色'?: string;
    '状态'?: string;
    '创建时间'?: number;
    '用户名'?: {
      text: string;
    };
  };
};

export type FeishuBitableUserListReadOneSearchrecordsInput = {
  pageSize?: number;
  fieldNames?: string[];
  sort?: {
    fieldName: string;
    desc?: boolean;
  }[];
  filter?: {
    conjunction?: string;
    conditions?: {
      fieldName: string;
      operator: string;
      value?: string[];
    }[];
  };
  pageToken?: string;
};

/**
 * const input: FeishuBitableUserListReadOneSearchrecordsInput = { pageSize, fieldNames, sort, ... };
 * capabilityClient.load('feishu_bitable_user_list_read_1').call<FeishuBitableUserListReadOneSearchrecordsOutput>('searchRecords', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { records, hasMore, pageToken, ... } = result;
 * 返回值形如：
 *   {"records":[{"id":"示例文本","record":{"用户名":{},"密码":null,"角色":"示例文本","状态":"示例文本","创建时间":0}}],"hasMore":false,"pageToken":"示例文本","total":0}
 */
export type FeishuBitableUserListReadOneSearchrecordsOutput = {
  records: {
    id: string;
    record: {
      '用户名'?: {
        text: string;
      };
      '密码'?: unknown;
      '角色'?: string;
      '状态'?: string;
      '创建时间'?: number;
    };
  }[];
  hasMore: boolean;
  pageToken?: string;
  total?: number;
};
// ---- end:feishu_bitable_user_list_read_1 ----