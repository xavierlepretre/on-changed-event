pragma solidity >=0.4.25 <0.6.0;

contract Emitter {
    event LogNumber(uint value);

    function pleaseEmit(uint value) public {
        emit LogNumber(value);
    }
}
