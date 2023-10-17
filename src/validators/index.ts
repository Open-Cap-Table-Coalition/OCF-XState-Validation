import valid_tx_stock_acceptance from './stock/tx_stock_acceptance';
import valid_tx_stock_cancellation from './stock/tx_stock_cancellation';
import valid_tx_stock_conversion from './stock/tx_stock_conversion';
import valid_tx_stock_issuance from './stock/tx_stock_issuance';
import valid_tx_stock_reissuance from './stock/tx_stock_reissuance';
import valid_tx_stock_repurchase from './stock/tx_stock_repurchase';
import valid_tx_stock_retraction from './stock/tx_stock_retraction';
import valid_tx_stock_transfer from './stock/tx_stock_transfer';

const validators = {
  valid_tx_stock_acceptance,
  valid_tx_stock_cancellation,
  valid_tx_stock_conversion,
  valid_tx_stock_issuance,
  valid_tx_stock_reissuance,
  valid_tx_stock_repurchase,
  valid_tx_stock_retraction,
  valid_tx_stock_transfer,
};

export default validators;
