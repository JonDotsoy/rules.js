
type InjectArgs = { crudAction: string, [key: string]: any };
type Evaluator<T extends object = any> = (arg?: T) => boolean;

type EvaluatorDefinitionFunction<T extends object = any> = (arg: T) => boolean | undefined;
type EvaluatorDefinition<T extends object = any> = EvaluatorDefinitionFunction<T> | boolean;
type ContextEvaluationCrud<T extends object = any> = {
  create?: EvaluatorDefinition<T>;
  read?: EvaluatorDefinition<T>;
  delete?: EvaluatorDefinition<T>;
  update?: EvaluatorDefinition<T>;
};

type ContextEvaluation<T extends object = any> = EvaluatorDefinition<T> | ContextEvaluationCrud<T>;

type RuleEvaluator = {
  test: Evaluator;
  testCreate: Evaluator;
  testRead: Evaluator;
  testUpdate: Evaluator;
  testDelete: Evaluator;
};

function getEvaluator(crudAction: 'create' | 'read' | 'update' | 'delete', contextEvaluation: ContextEvaluation) {
  if (typeof contextEvaluation === 'boolean') return contextEvaluation as boolean;
  if (typeof contextEvaluation === 'function') return contextEvaluation as Evaluator;
  if (typeof contextEvaluation === 'object') {
    if (crudAction in contextEvaluation) return contextEvaluation[crudAction] as Evaluator;
    return false;
  }
  return false;
}

export function test<O extends object = any, T extends object = any>(crudAction: 'create' | 'read' | 'update' | 'delete', contextEvaluation: ContextEvaluation<T>, arg: O): boolean {
  const evaluator = getEvaluator(crudAction, contextEvaluation);

  if (typeof evaluator === 'boolean') return evaluator;

  try {
    const result = evaluator({ crudAction, ...arg });
    return result ? result : false;
  } catch {
    return false;
  }
}

const noopRule: RuleEvaluator = {
  test: () => false,
  testCreate: () => false,
  testRead: () => false,
  testUpdate: () => false,
  testDelete: () => false,
};

export function createRules<O extends object = any, K extends string | number = string>(definitionRules: { [rule in K]: ContextEvaluation<O & InjectArgs> }) {
  type keyRules = keyof typeof definitionRules;
  const contexts = {} as { [rule in keyRules]: RuleEvaluator };

  Object.entries(definitionRules)
    .forEach(([keyContext, contextEvaluation]: any) => {
      contexts[keyContext as keyRules] = {
        test: (arg) => test('read', contextEvaluation, arg),
        testCreate: (arg) => test('create', contextEvaluation, arg),
        testRead: (arg) => test('read', contextEvaluation, arg),
        testUpdate: (arg) => test('update', contextEvaluation, arg),
        testDelete: (arg) => test('delete', contextEvaluation, arg),
      };
    });

  const getRule = (rule: keyRules) => rule in contexts ? contexts[rule] : noopRule;

  return Object.assign(getRule, contexts);
}


