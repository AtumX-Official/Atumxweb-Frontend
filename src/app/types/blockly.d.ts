import "blockly/core";

declare module "blockly/core" {
  interface CodeGenerator {
    ORDER_ATOMIC: number;
    ORDER_MEMBER: number;
    ORDER_FUNCTION_CALL: number;
    ORDER_EXPONENTIATION: number;
    ORDER_UNARY_SIGN: number;
    ORDER_MULTIPLICATIVE: number;
    ORDER_ADDITIVE: number;
    ORDER_RELATIONAL: number;
    ORDER_LOGICAL_NOT: number;
    ORDER_LOGICAL_AND: number;
    ORDER_LOGICAL_OR: number;
    ORDER_CONDITIONAL: number;
    ORDER_NONE: number;
    addIndentation(code: string): string;
    getOperatorSymbol(operator: string): string;
  }

  interface Block {
    processed?: boolean;
  }

  interface Field<T> {
    getVariable(): VariableModel;
  }
}
