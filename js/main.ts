/** Daniel Chumak | uncrustify_config v0.2.0 | GPLv2+ License
    github.com/CDanU/uncrustify_config */

/// <reference path="../uncrustify/emscripten/libUncrustify.d.ts" />


type HTMLElementValue    = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type OptionPrimitiveType = string | boolean | number;

import * as libUncrustify from "libUncrustify";
import * as fileSaver from "file-saver";
import * as ko from "knockout";
import * as ace from "brace"

require( 'brace/theme/solarized_dark' );
require( 'brace/mode/javascript' );
require( 'brace/mode/c_cpp' );

module uncrustify_config
{
    const Uncrustify: LibUncrustify.Uncrustify = libUncrustify;
    Uncrustify.quiet();

    const editor = ace.edit( "exampleEditorBox" );
    editor.$blockScrolling = Infinity;

    const editorSession = editor.getSession();
    editor.setShowInvisibles( true ); // shows whitespace
    editor.setShowPrintMargin( true );
    editorSession.setTabSize( 8 );
    editor.setFontSize( "12pt" );
    editor.setTheme( "ace/theme/solarized_dark" );
    // TODO: change language highlighting based on selected option
    editorSession.setMode( 'ace/mode/c_cpp' );

    namespace SelectorCache
    {
        export const TabContainers: HTMLElement[] = [
            document.getElementById( "tab0" ),
            document.getElementById( "tab1" ),
            document.getElementById( "tab2" ),
            document.getElementById( "tab3" )
        ];
        export const Tabs = < NodeListOf < HTMLElement > > document.querySelectorAll( "nav div" );
        export const ConfigInput          = < HTMLTextAreaElement > document.getElementById( "configInput" );
        export const ConfigDescriptionBox = < HTMLTextAreaElement > document.getElementById( "configDescriptionBox" );
        export const ConfigOutput = < HTMLTextAreaElement > document.getElementById( "configOutput" );
        export const ConfigOutputWithDoc      = < HTMLInputElement > document.getElementById( "configOutputWithDoc" );
        export const ConfigOutputOnlyNDefault = < HTMLInputElement > document.getElementById( "configOutputOnlyNDefault" );
        export const FileInput        = < HTMLTextAreaElement > document.getElementById( "fileInput" );
        export const FileOutput       = < HTMLTextAreaElement > document.getElementById( "fileOutput" );
        export const FileInputConfig  = < HTMLInputElement > document.getElementById( "fileInputConfig" );
        export const FileInputFile    = < HTMLInputElement > document.getElementById( "fileInputFile" );
        export const SaveConfig       = < HTMLInputElement > document.getElementById( "saveConfig" );
        export const SaveFileFormated = < HTMLInputElement > document.getElementById( "saveFileFormated" );
        export const ExampleEditorBox = < HTMLDivElement > document.getElementById("exampleEditorBox");
        export const OutputTypeToggle = < HTMLInputElement > document.getElementById("output_toggle");
    }

    enum UpdateSource
    {
        Editor       = 0,
        ConfigOutput = 1,
        ConfigInput  = 2,
        None         = 999,
    }

    enum TabStates
    {
        readConfigFile   = 0,
        editConfig       = 1,
        outputConfigFile = 2,
        fileIO = 3,
    }

    const dependencyMap = new Map< string, string[] >( [
        // -------------------------------------------------------------------------------------------------------------


        [ "output_tab_size", [ "align_with_tabs" ] ],
        // -------------------------------------------------------------------------------------------------------------
        [ "sp_arith", ["sp_arith_additive"]],
        [ "sp_assign", ["sp_before_assign", "sp_after_assign", "sp_assign_default", "sp_enum_assign"]],
        [ "sp_enum_assign", ["sp_enum_before_assign", "sp_enum_after_assign"]],
        [ "sp_inside_paren", ["sp_inside_newop_paren", "sp_inside_paren_cast"]],
        [ "sp_inside_newop_paren", ["sp_inside_newop_paren_open", "sp_inside_newop_paren_close"]],
        [ "sp_before_ptr_star", ["sp_before_unnamed_ptr_star", "sp_before_ptr_star_func"]],
        [ "sp_before_byref", ["sp_before_unnamed_byref", "sp_before_byref_func"]],
        [ "sp_before_unnamed_byref", ["use_options_overriding_for_qt_macros"]],
        [ "sp_before_angle", ["sp_template_angle"]],
        [ "sp_after_angle", ["sp_angle_colon"]],
        [ "sp_angle_paren", ["sp_angle_paren_empty"]],
        [ "sp_inside_sparen", ["sp_inside_sparen_open", "sp_inside_sparen_close"]],
        [ "sp_before_semi", ["sp_special_semi", "sp_before_semi_for", "sp_before_semi_for_empty"]],
        [ "sp_after_semi", ["sp_after_semi_for", "sp_after_semi_for_empty"]],
        [ "sp_after_comma", ["sp_after_mdatype_commas", "use_options_overriding_for_qt_macros"]],
        [ "sp_after_mdatype_commas", ["sp_between_mdatype_commas"]],
        [ "sp_before_comma", ["sp_paren_comma", "use_options_overriding_for_qt_macros"]],
        [ "sp_paren_comma", ["sp_before_mdatype_commas"]],
        [ "sp_after_operator_sym", ["sp_after_operator_sym_empty"]],
        [ "sp_func_proto_paren", ["sp_func_proto_paren_empty"]],
        [ "sp_func_def_paren", ["sp_func_def_paren_empty"]],
        [ "sp_inside_fparen", ["sp_inside_fparens"]],
        [ "sp_inside_fparens", ["use_options_overriding_for_qt_macros"]],
        [ "sp_fparen_brace", ["sp_fparen_dbrace"]],
        [ "sp_func_call_paren", ["sp_func_call_paren_empty"]],
        [ "sp_func_class_paren", ["sp_func_class_paren_empty"]],
        [ "sp_after_throw", ["sp_throw_paren"]],
        [ "sp_after_oc_colon", ["sp_after_send_oc_colon"]],
        [ "sp_before_oc_colon", ["sp_before_send_oc_colon"]],
        [ "sp_cond_colon", ["sp_cond_colon_after", "sp_cond_colon_before"]],
        [ "sp_cond_question", ["sp_cond_question_after", "sp_cond_question_before"]],
        [ "sp_cmt_cpp_start", ["cmt_cpp_group", "cmt_cpp_to_c"]],
        [ "sp_inside_braces", ["sp_inside_type_brace_init_lst", "sp_inside_braces_struct", "sp_inside_braces_enum"]],
        [ "sp_inside_type_brace_init_lst", ["sp_before_type_brace_init_lst_close", "sp_after_type_brace_init_lst_open"]],
        [ "sp_endif_cmt", ["sp_before_tr_emb_cmt", "indent_relative_single_line_comments"]],
        [ "sp_before_tr_emb_cmt", ["sp_endif_cmt", "indent_relative_single_line_comments", "sp_num_before_tr_emb_cmt"]],
        [ "sp_paren_paren", ["use_options_overriding_for_qt_macros"]],
        [ "sp_after_type", ["use_options_overriding_for_qt_macros"]],
        [ "sp_after_constr_colon", ["indent_ctor_init_leading"]],
        // -------------------------------------------------------------------------------------------------------------
        //[ "indent_columns", ["align_right_cmt_span", "", ""] ],
        [ "indent_continue", [ "use_indent_continue_only_once", "indent_paren_nl" ] ],
        [ "indent_func_call_param", ["indent_param", "indent_func_param_double"]],
        [ "indent_func_proto_param", ["indent_param", "indent_func_param_double"]],
        [ "indent_func_class_param", ["indent_param", "indent_func_param_double"]],
        [ "indent_template_param", ["indent_param", "indent_func_param_double"]],
        [ "indent_func_ctor_var_param", ["indent_param", "indent_func_param_double"]],
        [ "indent_func_def_param", ["indent_param", "indent_func_param_double"]],
        [ "indent_with_tabs", ["indent_cmt_with_tabs"] ], //?
        [ "indent_braces", ["indent_braces_no_func", "indent_braces_no_class", "indent_braces_no_struct"] ],
        [ "indent_namespace", ["indent_namespace_single_indent"] ],
        [ "indent_class_colon", ["indent_class_on_colon"] ],
        [ "indent_constr_colon", ["indent_class_on_colon", "indent_ctor_init_leading", "indent_ctor_init"] ],
        [ "indent_var_def_cont", ["indent_continue"] ],
        [ "indent_sing_line_comments", ["indent_relative_single_line_comments"] ],
        [ "indent_relative_single_line_comments", ["indent_sing_line_comments"] ],
        [ "indent_switch_case", ["indent_case_shift"] ],
        [ "indent_case_shift", ["indent_switch_case"] ],
        [ "indent_access_spec", ["indent_access_spec_body"] ],
        [ "indent_bool_paren", ["indent_first_bool_expr"] ],
        [ "indent_align_assign", ["indent_continue"] ],
        [ "indent_oc_block", ["indent_oc_block_msg_from_keyword", "indent_oc_block_msg_from_colon",
                              "indent_oc_block_msg_from_caret", "indent_oc_block_msg_from_brace"] ],
        [ "indent_oc_block_msg_xcode_style", ["indent_oc_block_msg_from_keyword", "indent_oc_block_msg_from_colon",
                                              "indent_oc_block_msg_from_caret", "indent_oc_block_msg_from_brace"] ],
        [ "indent_min_vbrace_open", ["indent_vbrace_open_on_tabstop"] ],
        // indent_token_after_brace - TODO too much options
        [ "indent_single_after_return", ["indent_off_after_return_new"] ],
        // -------------------------------------------------------------------------------------------------------------
        [ "nl_collapse_empty_body", ["nl_type_brace_init_lst_open", "nl_type_brace_init_lst_close"] ],
        [ "nl_start_of_file", ["nl_start_of_file_min"] ],
        [ "nl_end_of_file", [ "nl_end_of_file_min" ] ],
        [ "nl_assign_square", ["nl_after_square_assign"] ],
        [ "nl_after_square_assign", ["nl_assign_square"] ],
        [ "nl_var_def_blk_end", ["nl_func_var_def_blk"] ],
        [ "nl_fcall_brace", ["nl_fdef_brace", "nl_property_brace", "nl_cpp_ldef_brace"] ],
        [ "nl_cpp_ldef_brace", ["nl_fdef_brace", "nl_property_brace"] ],
        [ "nl_property_brace", ["nl_fdef_brace"] ],
        [ "nl_if_brace", ["nl_define_macro", "nl_elseif_brace"] ],
        // nl_multi_line_cond - TODO too much options
        [ "nl_after_case", ["nl_case_colon_brace"] ],
        [ "pos_class_colon", ["nl_class_colon", "nl_class_init_args", "pos_class_comma"] ],
        [ "nl_class_colon", ["pos_class_colon", "nl_class_init_args", "pos_class_comma"] ],
        [ "nl_class_init_args", ["pos_class_colon", "nl_class_colon", "pos_class_comma"] ],
        [ "pos_class_comma", ["pos_class_colon", "nl_class_colon", "nl_class_init_args"] ],
        [ "pos_constr_colon", ["nl_constr_colon", "nl_constr_init_args", "pos_constr_comma"] ],
        [ "nl_constr_colon", ["pos_constr_colon", "nl_constr_init_args", "pos_constr_comma"] ],
        [ "nl_constr_init_args", ["pos_constr_colon", "nl_constr_colon", "pos_constr_comma"] ],
        [ "pos_constr_comma", ["pos_constr_colon", "nl_constr_colon", "nl_constr_init_args"] ],
        [ "nl_ds_struct_enum_cmt", ["nl_enum_own_lines"] ],
        [ "nl_func_type_name", ["nl_func_type_name_class"] ],
        [ "nl_func_proto_type_name", ["nl_func_type_name_class"] ],
        [ "nl_func_def_start", ["nl_func_def_start_single"] ],
        [ "nl_func_decl_start", ["nl_func_decl_start_single"] ],
        [ "nl_func_def_end", ["nl_func_def_end_single"] ],
        [ "nl_func_decl_end", ["nl_func_decl_end_single"] ],
        [ "nl_func_def_start_multi_line", ["nl_func_def_args_multi_line", "nl_func_def_end_multi_line"] ],
        [ "nl_func_def_args_multi_line", ["nl_func_def_start_multi_line", "nl_func_def_end_multi_line"] ],
        [ "nl_func_def_end_multi_line", ["nl_func_def_start_multi_line", "nl_func_def_args_multi_line"] ],
        [ "nl_func_call_start_multi_line", ["nl_func_call_args_multi_line", "nl_func_call_end_multi_line"] ],
        [ "nl_func_call_args_multi_line", ["nl_func_call_start_multi_line", "nl_func_call_end_multi_line"] ],
        [ "nl_func_call_end_multi_line", ["nl_func_call_start_multi_line", "nl_func_call_args_multi_line"] ],
        [ "nl_func_decl_start_multi_line", ["nl_func_decl_args_multi_line", "nl_func_decl_end_multi_line"] ],
        [ "nl_func_decl_args_multi_line", ["nl_func_decl_start_multi_line", "nl_func_decl_end_multi_line"] ],
        [ "nl_func_decl_end_multi_line", ["nl_func_decl_start_multi_line", "nl_func_decl_args_multi_line"] ],
        [ "nl_oc_msg_args", ["nl_oc_msg_leave_one_liner"] ],
        [ "nl_type_brace_init_lst_open", ["nl_type_brace_init_lst_close"] ],
        [ "nl_type_brace_init_lst_close", ["nl_type_brace_init_lst_open"] ],
        [ "nl_after_brace_open", ["nl_after_brace_open_cmt"] ],
        [ "nl_after_vbrace_open", ["nl_after_vbrace_open_empty"] ],
        [ "nl_after_vbrace_open_empty", ["nl_after_vbrace_open"] ],
        // nl_define_macro - TODO too much options
        [ "nl_squeeze_ifdef", ["nl_squeeze_ifdef_top_level"] ],
        [ "nl_ds_struct_enum_close_brace", ["eat_blanks_before_close_brace"] ],
        // -------------------------------------------------------------------------------------------------------------
        [ "pos_bool", ["sp_bool"] ],
        [ "pos_enum_comma", ["pos_comma"] ],
        // -------------------------------------------------------------------------------------------------------------
        [ "ls_for_split_full", ["ls_code_width"] ],
        [ "ls_func_split_full", ["ls_code_width"] ],
        // -------------------------------------------------------------------------------------------------------------
        [ "align_with_tabs", ["align_keep_tabs"] ],
        [ "align_on_tabstop", ["align_number_right"] ],
        [ "align_func_params_span", ["align_func_params_thresh", "align_func_params_gap"] ],
        [ "align_var_def_span", ["align_on_operator", "align_var_def_inline", "align_var_struct_thresh",
                                 "align_var_struct_gap", "align_var_class_thresh", "align_var_class_gap",
                                 "align_var_def_thresh", "align_var_def_gap", "align_var_def_attribute",
                                 "align_var_def_colon_gap"] ],
        [ "align_var_struct_span", ["align_var_def_span", "align_on_operator", "align_var_def_inline",
                                    "align_var_struct_thresh", "align_var_struct_gap", "align_var_class_thresh",
                                    "align_var_class_gap", "align_var_def_thresh", "align_var_def_gap",
                                    "align_var_def_attribute", "align_var_def_colon_gap"] ],
        [ "align_var_class_span", ["align_var_def_span", "align_on_operator", "align_var_def_inline",
                                   "align_var_struct_thresh", "align_var_struct_gap", "align_var_class_thresh",
                                   "align_var_class_gap", "align_var_def_thresh", "align_var_def_gap",
                                   "align_var_def_attribute", "align_var_def_colon_gap"] ],
        [ "align_assign_span", ["align_assign_thresh", "align_enum_equ_thresh"] ],
        [ "align_enum_equ_span", ["align_assign_thresh", "align_assign_span", "align_enum_equ_thresh"] ],
        [ "align_typedef_span", ["align_typedef_gap", "align_typedef_star_style", "align_typedef_amp_style"] ],
        [ "align_func_proto_span", ["align_mix_var_proto", "align_func_proto_gap", "align_single_line_brace_gap",
                                    "align_single_line_func", "align_single_line_brace", "align_on_operator"] ],
        [ "align_mix_var_proto", ["align_single_line_func", "align_single_line_brace", "align_on_operator"] ],
        [ "align_single_line_func", ["align_single_line_brace", "align_on_operator"] ],
        [ "align_pp_define_span", ["align_pp_define_gap", "align_pp_define_together"] ],
        [ "align_left_shift", ["indent_columns"] ],
        [ "align_oc_msg_colon_span", ["align_on_tabstop", "align_oc_msg_colon_first", "indent_oc_msg_colon",
                                      "indent_columns", "indent_oc_msg_prioritize_first_colon"] ],
        [ "align_oc_decl_colon", ["align_on_tabstop"] ],
        // -------------------------------------------------------------------------------------------------------------
        [ "cmt_width", ["cmt_sp_after_star_cont"] ],
        [ "cmt_star_cont", ["cmt_indent_multi", "cmt_sp_after_star_cont", "cmt_sp_before_star_cont"] ],
        [ "cmt_sp_before_star_cont", ["cmt_star_cont", "cmt_indent_multi"] ],
        [ "cmt_indent_multi", ["cmt_sp_before_star_cont", "cmt_star_cont", "cmt_sp_after_star_cont",
                               "cmt_multi_check_last", "cmt_multi_first_len_minimum"] ],
        [ "cmt_insert_func_header", ["cmt_insert_before_ctor_dtor", "cmt_insert_before_preproc",
                                     "cmt_insert_before_inlines"] ],
        [ "cmt_insert_class_header", ["cmt_insert_before_preproc", "cmt_insert_before_inlines"] ],
        [ "cmt_insert_oc_msg_header", ["cmt_insert_before_preproc"] ],
        [ "cmt_reflow_mode", [ "cmt_width" ] ],
        // -------------------------------------------------------------------------------------------------------------
        [ "mod_full_brace_if_chain", ["mod_full_brace_if_chain_only"] ],
        [ "mod_full_brace_if", ["mod_full_brace_nl_block_rem_mlcond"] ],
        [ "mod_full_brace_do", ["mod_full_brace_nl_block_rem_mlcond"] ],
        [ "mod_full_brace_for", ["mod_full_brace_nl_block_rem_mlcond"] ],
        [ "mod_full_brace_using", ["mod_full_brace_nl_block_rem_mlcond"] ],
        [ "mod_full_brace_while", ["mod_full_brace_nl_block_rem_mlcond"] ],
        [ "mod_move_case_break", ["mod_case_brace"] ],
        ["mod_sort_oc_properties", ["mod_sort_oc_property_class_weight", "mod_sort_oc_property_thread_safe_weight",
                                    "mod_sort_oc_property_readwrite_weight", "mod_sort_oc_property_reference_weight",
                                    "mod_sort_oc_property_getter_weight", "mod_sort_oc_property_setter_weight",
                                    "mod_sort_oc_property_nullability_weight",]],
        [ "mod_sort_include", ["include_category_0", "include_category_1", "include_category_2"] ],
        // -------------------------------------------------------------------------------------------------------------
        [ "pp_indent", ["pp_indent_count"] ],
        [ "pp_define_at_level", ["pp_indent_at_level"] ],
        [ "pp_indent_at_level", ["pp_define_at_level"] ],
        [ "pp_space", ["pp_space_count"] ],
        // -------------------------------------------------------------------------------------------------------------
        [ "use_indent_func_call_param", [ "indent_func_call_param" ] ],
    ] );

    // options that do not operate on their own and need a parent option activated
    const childOptions_depend = new Set< string >([
        "sp_num_before_tr_emb_cmt",
        "sp_after_operator_sym_empty",

        "indent_param",
        "indent_func_param_double",
        "indent_braces_no_class",
        "indent_braces_no_func",
        "indent_braces_no_struct",
        "indent_class_on_colon",
        "indent_ctor_init_leading",
        "indent_ctor_init",
        "indent_first_bool_expr",
        "indent_oc_block_msg_from_keyword",
        "indent_oc_block_msg_from_colon",
        "indent_oc_block_msg_from_caret",
        "indent_oc_block_msg_from_brace",
        "indent_vbrace_open_on_tabstop",
        "indent_namespace_single_indent",

        "nl_start_of_file_min",
        "nl_end_of_file_min",
        "nl_after_brace_open_cmt",
        "nl_squeeze_ifdef_top_level",

        "align_func_params_thresh",
        "align_func_params_gap",
        "align_enum_equ_thresh",
        "align_assign_thresh",
        "align_typedef_gap",
        "align_typedef_star_style",
        "align_typedef_amp_style",
        "align_func_proto_gap",
        "align_on_operator",
        "align_pp_define_gap",
        "align_pp_define_together",
        "align_oc_msg_colon_first",
        "indent_oc_msg_colon",
        "indent_oc_msg_prioritize_first_colon",
        "align_var_def_inline",
        "align_var_struct_thresh",
        "align_var_struct_gap",
        "align_var_class_thresh",
        "align_var_class_gap",
        "align_var_def_thresh",
        "align_var_def_gap",
        "align_var_def_attribute",
        "align_var_def_colon_gap",

        "cmt_multi_check_last",
        "cmt_multi_first_len_minimum",
        "cmt_sp_after_star_cont",
        "cmt_insert_before_ctor_dtor",

        "mod_sort_oc_property_class_weight",
        "mod_sort_oc_property_thread_safe_weight",
        "mod_sort_oc_property_readwrite_weight",
        "mod_sort_oc_property_reference_weight",
        "mod_sort_oc_property_getter_weight",
        "mod_sort_oc_property_setter_weight",
        "mod_sort_oc_property_nullability_weight",

        "pp_indent_count",
        "pp_space_count",
    ]);

    // region exampleStrings
    enum ExampleStringEnum
    {
        noExample,
        noExampleYet,
        example1,
        example2,
        indentBraces,
        example4,
        multiNamespace,
        arith,
        paren,
        brace,
        func,
        cls,
        space_misc,
        if_else,
        string,
        indentBraceParent,
    }

    const exampleStringEnum_string_Map = new Map<ExampleStringEnum, string>( [
        [ ExampleStringEnum.noExample, require("!!raw-loader!../examples/e000.txt").default ],
        [ ExampleStringEnum.noExampleYet, require("!!raw-loader!../examples/e001.txt").default ],
        [ ExampleStringEnum.example1, require("!!raw-loader!../examples/e002.txt").default ],
        [ ExampleStringEnum.example2, require("!!raw-loader!../examples/e003.txt").default ],
        [ ExampleStringEnum.indentBraces, require("!!raw-loader!../examples/e004.txt").default ],
        [ ExampleStringEnum.multiNamespace, require("!!raw-loader!../examples/e005.txt").default ],
        [ ExampleStringEnum.arith, require("!!raw-loader!../examples/e006.txt").default ],
        [ ExampleStringEnum.paren, require("!!raw-loader!../examples/e007.txt").default ],
        [ ExampleStringEnum.brace, require("!!raw-loader!../examples/e008.txt").default ],
        [ ExampleStringEnum.func, require("!!raw-loader!../examples/e009.txt").default ],
        [ ExampleStringEnum.cls, require("!!raw-loader!../examples/e010.txt").default ],
        [ ExampleStringEnum.space_misc, require("!!raw-loader!../examples/e011.txt").default ],
        [ ExampleStringEnum.if_else, require("!!raw-loader!../examples/e012.txt").default ],
        [ ExampleStringEnum.string, require("!!raw-loader!../examples/e013.txt").default ],
        [ ExampleStringEnum.indentBraceParent, require("!!raw-loader!../examples/e014.txt").default ],
    ]);

    const optionNameString_Map = new Map<string, string>( [
        ["sp_arith", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_assign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cpp_lambda_assign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cpp_lambda_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_assign_default", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_before_assign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_after_assign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        // sp_enum_paren //OC
        ["sp_enum_assign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_enum_before_assign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_enum_after_assign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_bool", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_compare", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cond_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cond_colon_before", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cond_colon_after", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cond_question", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cond_question_before", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cond_question_after", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cond_ternary_short", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_before_tr_emb_cmt", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["align_right_cmt_span", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["align_assign_span", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["disable_processing_cmt", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
        ["enable_processing_cmt", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
        ["input_tab_size", exampleStringEnum_string_Map.get( ExampleStringEnum.example1) ],
        ["newlines", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["output_tab_size", exampleStringEnum_string_Map.get( ExampleStringEnum.example1) ],
        ["tok_split_gte", exampleStringEnum_string_Map.get( ExampleStringEnum.example2) ],
        ["utf8_bom", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
        ["utf8_byte", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
        ["utf8_force", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],
        ["sp_before_sparen", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_inside_sparen", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_inside_sparen_close", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_inside_sparen_open", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_after_sparen", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_sparen_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        //["sp_special_semi", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_before_semi", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_before_semi_for", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_before_semi_for_empty", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_before_squares", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_inside_square", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_after_comma", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_before_comma", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],

        //["sp_before_ellipsis", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_after_class_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_before_class_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_after_constr_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_before_constr_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_before_case_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],

        ["sp_after_operator", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_after_operator_sym", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],

        ["sp_after_cast", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_inside_paren_cast", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],

        ["sp_sizeof_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],

        ["sp_inside_braces_enum", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],

        ["sp_inside_braces_struct", exampleStringEnum_string_Map.get( ExampleStringEnum.brace) ],
        ["sp_inside_braces", exampleStringEnum_string_Map.get( ExampleStringEnum.brace) ],
        ["sp_inside_braces_empty", exampleStringEnum_string_Map.get( ExampleStringEnum.brace) ],

        ["sp_type_func", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_func_proto_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_func_proto_paren_empty", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_func_def_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_func_def_paren_empty", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],

        ["sp_inside_fparens", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_inside_fparen", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],

        ["sp_inside_tparen", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_after_tparen_close", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],

        //["sp_square_fparen", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["sp_fparen_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        //["sp_fparen_dbrace", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_func_call_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_func_call_paren_empty", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],
        ["sp_return_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.func) ],

        ["sp_func_call_user_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.noExample) ],



        ["sp_func_class_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_func_class_paren_empty", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],

        ["sp_attribute_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        ["sp_defined_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        //["sp_after_throw", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        ["sp_catch_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        //["sp_version_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        //["sp_scope_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        //["sp_super_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        //["sp_this_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        ["sp_macro", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        ["sp_macro_func", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        ["sp_brace_typedef", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        //["sp_catch_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        ["sp_brace_catch", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        //["sp_finally_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        //["sp_brace_finally", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        ["sp_try_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        //["sp_getset_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        ["sp_word_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        ["sp_word_brace_ns", exampleStringEnum_string_Map.get( ExampleStringEnum.multiNamespace) ],

        ["sp_before_dc", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_after_dc", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],

        //["sp_d_array_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        ["sp_else_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.if_else) ],
        ["sp_brace_else", exampleStringEnum_string_Map.get( ExampleStringEnum.if_else) ],


        ["sp_not", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_inv", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_sign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_incdec", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],

        ["sp_addr", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        ["sp_member", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_deref", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],

        ["sp_sign", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_incdec", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],

        ["sp_before_nl_cont", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        ["sp_cond_ternary_short", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],


        //["sp_case_label", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        //["sp_range", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],

        // not working ?
        //["sp_after_for_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        //["sp_before_for_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],

        //["sp_extern_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],


        ["sp_cmt_cpp_start", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cmt_cpp_doxygen", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],
        ["sp_cmt_cpp_qttr", exampleStringEnum_string_Map.get( ExampleStringEnum.arith) ],

        ["sp_endif_cmt", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        ["sp_after_new", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],
        ["sp_between_new_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        //["sp_annotation_paren", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],//java

        ["sp_skip_vbrace_tokens", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],

        ["force_tab_after_define", exampleStringEnum_string_Map.get( ExampleStringEnum.space_misc) ],


        ["indent_columns", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_continue", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],

        ["indent_with_tabs", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_cmt_with_tabs", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],

        ["indent_brace", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_braces", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_brace_parent", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraceParent) ],
        //
        //
        ["indent_namespace", exampleStringEnum_string_Map.get( ExampleStringEnum.multiNamespace) ],
        //d
        ["indent_class", exampleStringEnum_string_Map.get( ExampleStringEnum.indentBraces) ],
        ["indent_class_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],
        ["indent_constr_colon", exampleStringEnum_string_Map.get( ExampleStringEnum.paren) ],






        ["indent_align_string", exampleStringEnum_string_Map.get( ExampleStringEnum.string) ],
        //




        ["sp_deref", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_deref", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_deref", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_deref", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_deref", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_deref", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],
        ["sp_deref", exampleStringEnum_string_Map.get( ExampleStringEnum.cls) ],

    ] );
    // endregion

    // region languageFlags
    //! formating language options display strings
    const langFlagsStrings = [
        "C",
        "C++",
        "D",
        "C#",
        "Vala",
        "Java",
        "PAWN",
        "Objective-C",
        "JavaScript",
    ];

    //! maps Uncrustify language options to display strings
    const stringLangFlagsMap = new Map<string, LibUncrustify.LanguageValue>( [
        [ langFlagsStrings[0], Uncrustify.Language.C ],
        [ langFlagsStrings[1], Uncrustify.Language.CPP ],
        [ langFlagsStrings[2], Uncrustify.Language.D ],
        [ langFlagsStrings[3], Uncrustify.Language.CS ],
        [ langFlagsStrings[4], Uncrustify.Language.VALA ],
        [ langFlagsStrings[5], Uncrustify.Language.JAVA ],
        [ langFlagsStrings[6], Uncrustify.Language.PAWN ],
        [ langFlagsStrings[7], Uncrustify.Language.OC ],
        [ langFlagsStrings[8], Uncrustify.Language.ECMA ],
    ] );
    // endregion
    //==========================================================================

    //! flag that is used to prevent multiple ViewModel initializations
    let modelBuild: boolean  = false;
    //! flags that are used for handling custom examples
    let editorFocused: boolean      = false;
    //! flags that are used for handling custom examples
    let editorChanged: boolean      = false;
    //! flags that are used for handling custom examples
    let customExampleUsed: boolean  = false;
    // ---
    //! updateSource: used to specify from which source the Uncrustify config needs
    //! to be updated, initially it is set to UpdateTarget.ConfigInput to catch
    //! the case where a page reload does not clear the text but no change event
    //! is fired
    let updateSource: UpdateSource = UpdateSource.ConfigInput;

    class Options
    {
        //! name of the option
        public name: string;
        //! type of the option, see Uncrustify.argtype_e
        public type: LibUncrustify.OptionTypeValue;
        //! option value, AT_BOOL -> bool, AT_Num -> number, else -> string
        public value: ko.Observable<OptionPrimitiveType>;
        public isDependentChild;
        //! stores option dependencies, initialy this variable is of type string[],
        //! but changes into options[] after the string have been resolved
        public dependencies;
        //! example on which the foramting will be performed
        public example: string;
        //! description of the option, consists of short and full description from Uncrustify
        public description: string;
        //! callback function that is called from the template to set the description
        public descriptionCallback: Function;
        //! callback function that is called from the template to handle changes
        public changeCallback: Function;
        public resetCallback: Function;

        constructor ( 
            name: string, 
            type: LibUncrustify.OptionTypeValue, 
            value: OptionPrimitiveType,
            description: string, 
            dependencies: string[], 
            example: string, 
            isDependentChild : boolean 
        )
        {
            this.name         = name;
            this.type         = type;
            this.value        = ko.observable( value );
            this.description  = description;
            this.dependencies = dependencies;
            this.example      = example;
            this.isDependentChild = isDependentChild;
            // -----------------------------------------------------------------
            this.descriptionCallback = function()
            {
                setDescription( this.description );
                return true;
            };
            this.changeCallback = optionChange;
            this.resetCallback = function(obj)
            {
                this.descriptionCallback();
                optionChange(obj);
                return true;
            };
        }
    }

    class OptionsGroup
    {
        // name of the goup
        public name: string;
        // array of all options that belong to the group
        public options: Options[];

        constructor( name: string )
        {
            this.name    = name;
            this.options = [];
        }

        addOption( option: Options )
        {
            this.options.push( option );
        };
    }

    class GroupOptionsViewModel
    {
        //! all uncrustify Groups
        public groups: ko.ObservableArray<OptionsGroup>;
        //! Uncrustifys text formatting option
        public isFragment: ko.Observable<boolean>;
        //! Uncrustifys text formatting option
        public fileLang: ko.Observable<string>;
        //! lookupMap to find Options
        public lookupMap = new Map<string, Options>();
        //! Uncrustifys Options for the type AT_IARF
        public AT_IARF = ['ignore', 'add', 'force', 'remove',];
        //! Uncrustifys Options for the type AT_POS
        public AT_POS  = ['ignore', 'join', 'lead', 'lead_break', 'lead_force', 'trail', 'trail_break', 'trail_force',];
        //! Uncrustifys Options for the type AT_LINE
        public AT_LINE = ['auto', 'lf', 'crlf', 'cr',];
        //! used inside the template to display available language options
        public langFlagStrings = langFlagsStrings;
        //----------------------------------------------------------------------

        /**
         *  builds lookupMap based on the options of the this.groups
         */
        private fillLookupMapFull()
        {
            for( let group of this.groups() )
            {
                for( let option of group.options )
                {
                    this.lookupMap.set( option.name, option );
                }
            }
        }

        /**
         * fills lookupMap based on the options of the passed in group
         * @param group: group which options will be added to the lookupMap
         */
        //private fillLookupMap( group: OptionsGroup )
        //{
        //    for( let option of group.options )
        //    {
        //        this.lookupMap.set( option.name, option );
        //    }
        //}

        /**
         * recursivly resolves string dependencies of Options
         * @param option: Option which dependencies will be resolved
         * @param unresolved: empty array that will get filled with unresolved options during the recursive steps
         * @param resolved: empty array that will get filled with resolved options during the recursive steps
         * @returns {string[]}: array with all resolved dependencies
         */
        private resolver( option: Options, unresolved: string[], resolved: string[] )
        {
            unresolved.push( option.name );

            for( let dependency of option.dependencies )
            {
                // skip if already resolved or
                // usually circular dependencies should throw an error, but here
                // their sub dependencies are just ignored (to break the circle)
                // in order to enable referencing from a->b and b->a
                // example: .a -> ..b -> ...c, ...a, ...d ==> b, c, d
                //          .b -> ..c, ..a, ..d           ==> a, c, d
                if( resolved.indexOf( dependency ) !== -1 ||
                    unresolved.indexOf( dependency ) !== -1 )
                {
                    continue;
                }

                let deppendencyOption = this.lookupMap.get( dependency );
                if( deppendencyOption == null )
                {
                    console.error( "dependency: " + dependency + " is missing in the lookupMap" );
                    continue;
                }

                this.resolver( deppendencyOption, unresolved, resolved );
            }

            resolved.push( option.name );

            // remove from unresolved
            const index0 = unresolved.indexOf( option.name );
            if( index0 > -1 ) { unresolved.splice( index0, 1 ); }

            if( unresolved.length === 0 )
            {
                // remove initial option
                const index1 = resolved.indexOf( option.name );
                if( index1 > -1 )
                { resolved.splice( index1, 1 ); }

                return resolved;
            }
        };

        /**
         * calls resolver on every option and to convert string dependencies to option dependencies
         */
        public resolveDependencies(): void
        {
            // resolves dependencies in order to guarantee all sub dependencies are included
            for( let group of this.groups() )
            {
                for( let option of group.options )
                {
                    option.dependencies = this.resolver( option, [], [] );
                }
            }

            // converts dependency strings[] into dependency Options[]
            // needs to be separated into two loops, so that the resolver only
            // works on strings and not a mix of string and Option
            for( let group of this.groups() )
            {
                for( let option of group.options )
                {
                    let optionDependencies: Options[] = [];
                    for( let dependency of option.dependencies )
                    {
                        let dependencyOption: Options = this.lookupMap.get( dependency );
                        if( dependencyOption == null )
                        {
                            console.error( "dependency: " + dependency + " is missing in the lookupMap" );
                            continue;
                        }
                        optionDependencies.push( dependencyOption );
                    }

                    option.dependencies = optionDependencies;
                }
            }
        }

        constructor()
        {
            this.isFragment = ko.observable( false );
            this.fileLang   = ko.observable( "C++" );
            this.groups     = ko.observableArray( [] );
            this.groups.subscribe( () => this.fillLookupMapFull.call( this ) );
        }
    }

    /**
     * alongside the event handlers this function controls the main program flow,
     * it manages tab and container styles, updates the Uncrustify config and
     * handles tab specific stuff
     *
     * @param nr: n-th tab that is going to be opened, 0-based
     * @returns {boolean}: false on failure
     */
    function openTab( nr: number ): boolean
    {
        if( isNaN(nr) || nr < 0 || nr >= SelectorCache.TabContainers.length )
        {
            return false;
        }

        // region manage active style state of tabs
        for( let elem of <any> SelectorCache.Tabs )
        {
            elem.classList.remove( "active" );
        }

        SelectorCache.Tabs[nr].classList.add( "active" );
        // endregion

        // region manage visibility of tab containers
        for( let elem of SelectorCache.TabContainers )
        {
            elem.style.display = "none";
            elem.classList.remove( "active" );
        }

        SelectorCache.TabContainers[nr].style.display = "flex";
        // endregion

        // region updateTarget
        switch( updateSource )
        {
            case UpdateSource.Editor:
            {
                loadSettingsFromModel();
                break;
            }
            case UpdateSource.ConfigInput:
            {
                loadSettings( SelectorCache.ConfigInput );
                break;
            }
            case UpdateSource.ConfigOutput:
            {
                loadSettings( SelectorCache.ConfigOutput );
                break;
            }
            default: {break;}
        }
        updateSource = UpdateSource.None;
        // endregion

        // region handle tab specific stuff
        switch( nr )
        {
            case TabStates.editConfig:
            {
                updateSource = UpdateSource.Editor;
                break;
            }
            case TabStates.outputConfigFile:
            {
                printSettings();
                break;
            }
            default: { break; }
        }
        // endregion

        return true;
    }

    /**
     * Value of passed Element is set as Uncrustifys config, calls updateModel
     * @param target which value will be set as Uncrustifys config
     */
    function loadSettings( target: HTMLElementValue ): void
    {
        Uncrustify.load_config( target.value );
        updateModel();
    }

    /**
     * sets Uncrustifys config based on the settings of the ViewModel
     */
    function loadSettingsFromModel(): void
    {
        ViewModel.lookupMap.forEach( function( option ){
            switch( option.type )
            {
                case Uncrustify.OptionType.IARF:
                case Uncrustify.OptionType.TOKENPOS:
                case Uncrustify.OptionType.LINEEND:
                case Uncrustify.OptionType.STRING:
                {
                    Uncrustify.option_set_value( option.name, < string > option.value() );
                    break;
                }

                case Uncrustify.OptionType.BOOL:
                {
                    Uncrustify.option_set_value( option.name, option.value() === true ? "true" : "false" );
                    break;
                }

                case Uncrustify.OptionType.NUM:
                case Uncrustify.OptionType.UNUM:
                {
                    
                    Uncrustify.option_set_value( option.name, option.value().toString() );
                    break;
                }

                default:
                {
                    return;
                }
            }
        } );
    }

    /**
     * prints current Uncrustify config according to the set output options into SelectorCache.ConfigOutput
     */
    function printSettings(): void
    {
        const optionDoc: boolean = SelectorCache.ConfigOutputWithDoc.checked;
        const optionDef: boolean = SelectorCache.ConfigOutputOnlyNDefault.checked;
        SelectorCache.ConfigOutput.value = Uncrustify.show_config( optionDoc, optionDef );
    }

    /**
     * used to change a single option in the Uncrustify configuration via the menu,
     * resets all Uncrustify options to default and sets the changed option and
     * its dependencies, handles example output
     * @param option: Option which value changed
     * @returns {boolean}: returns true to simulate html element default event handling
     */
    function optionChange( option: Options ): boolean
    {
        // reset all uncrustify options to default values
        Uncrustify.reset_options();

        // set changed option
        Uncrustify.option_set_value( option.name, option.value().toString() );

        // set the dependencies of the option
        for( let dependency of option.dependencies )
        {
            Uncrustify.option_set_value( dependency.name, dependency.value().toString() );
        }

        // output_tab_size seems to be a global dependency
        const outputTabSizeOption: Options = ViewModel.lookupMap.get( "output_tab_size" );
        if( outputTabSizeOption != null )
        {
            Uncrustify.option_set_value( "output_tab_size", outputTabSizeOption.value().toString() );
        }
        const indentWithTabsOption: Options = ViewModel.lookupMap.get( "indent_with_tabs" );
        if( indentWithTabsOption != null )
        {
            Uncrustify.option_set_value( "indent_with_tabs", indentWithTabsOption.value().toString() );
        }
        // ----

        // write formated text to editor
        let crustyText = customExampleUsed ? editorSession.getValue() : option.example;
        editorSession.setValue( Uncrustify.uncrustify( crustyText, Uncrustify.Language.CPP ) );

        return true;
    }

    /**
     * builds Knockout Model from Uncrustifys Groups and Options
     */
    function buildModel()
    {
        if( modelBuild ) { return; }

        const groups = Uncrustify.get_groups ();
        const groupsLen = groups.size ();

        let groupsArr: OptionsGroup[] = [];        

        for(let groupsIdx = 0; groupsIdx < groupsLen; ++groupsIdx)
        {
            const group = groups.get (groupsIdx);

            let group_object = new OptionsGroup(group.description);

            const options = group.options;
            const optionsLen = options.size ();
            
            for(let optionsIdx = 0; optionsIdx < optionsLen; ++optionsIdx)
            {
                const option = options.get(optionsIdx);

                let option_setting: OptionPrimitiveType;
                switch( option.type() as LibUncrustify.OptionTypeValue )
                {
                    case Uncrustify.OptionType.IARF:
                    case Uncrustify.OptionType.TOKENPOS:
                    case Uncrustify.OptionType.LINEEND:
                    case Uncrustify.OptionType.STRING:
                    {
                        option_setting = option.value ();
                        break;
                    }

                    case Uncrustify.OptionType.BOOL:
                    {
                        option_setting = option.value () === 'true';
                        break;
                    }

                    case Uncrustify.OptionType.NUM:
                    case Uncrustify.OptionType.UNUM:
                    {
                        option_setting = parseInt(option.value ());
                        break;
                    }

                    default:
                    {
                        continue;
                    }
                }

                let dependencies: string[] = dependencyMap.get(option.name ());
                if( dependencies == null ) { dependencies = []; }

                let example: string = optionNameString_Map.get(option.name ());
                if( example == null ) 
                { 
                    example = exampleStringEnum_string_Map.get (
                        ExampleStringEnum.noExampleYet
                    ); 
                }

                const isDependentChild = childOptions_depend.has(option.name ());
                const description = option.name () + ": " + option.description();


                const option_object = new Options ( 
                    option.name (),
                    option.type (),
                    option_setting,
                    description,
                    dependencies, 
                    example,
                    isDependentChild
                );

                group_object.addOption( option_object );
            }

            groupsArr.push( group_object );
        }
        ViewModel.groups( groupsArr );
        ViewModel.resolveDependencies();

        // special case: adjusts editor tab size
        const outputTabSizeOption = ViewModel.lookupMap.get( "output_tab_size" );
        if( outputTabSizeOption != null )
        {
            editorSession.setTabSize(<number> outputTabSizeOption.value());

            outputTabSizeOption.value.subscribe (
                function (o: number) 
                {
                    editorSession.setTabSize( o );
                }
            );
        }
        modelBuild = true;
    }

    /**
     *  updates ViewModel based on Uncrustifys currently loaded settings
     */
    function updateModel()
    {
        ViewModel.lookupMap.forEach( function( option ){
            let optVal: OptionPrimitiveType;

            switch( option.type )
            {
                case Uncrustify.OptionType.IARF:
                case Uncrustify.OptionType.TOKENPOS:
                case Uncrustify.OptionType.LINEEND:
                case Uncrustify.OptionType.STRING:
                {
                    optVal = Uncrustify.option_get_value( option.name );
                    break;
                }

                case Uncrustify.OptionType.BOOL:
                {
                    optVal = Uncrustify.option_get_value( option.name ) === 'true';
                    break;
                }

                case Uncrustify.OptionType.NUM:
                case Uncrustify.OptionType.UNUM:
                {
                    optVal = parseInt( Uncrustify.option_get_value( option.name ) );
                    break;
                }

                default:
                {
                    return;
                }
            }

            option.value( optVal );
        } );
    }

    /**
     * fills SelectorCache.ConfigDescriptionBox with given string
     */
    function setDescription( text: string )
    {
        SelectorCache.ConfigDescriptionBox.value = text;
    }

    /**
     * fills SelectorCache.FileOutput with an uncrustifyed value of SelectorCache.FileInput
     * checks frag and language settings
     */
    function processFile()
    {
        const isFrag      = ViewModel.isFragment();
        const langString  = ViewModel.fileLang();
        const outputType  = SelectorCache.OutputTypeToggle.checked;
        let   langEnumObj = stringLangFlagsMap.get( langString );

        if( langEnumObj == null )
        {
            console.error( "No fitting Enum Object found for the language" + langString + " Language set to C++" );
            langEnumObj = Uncrustify.Language.CPP;
        }

        if(outputType)
        {
            SelectorCache.FileOutput.value = Uncrustify.debug( SelectorCache.FileInput.value, langEnumObj, isFrag );
        }
        else
        {
            SelectorCache.FileOutput.value = Uncrustify.uncrustify( SelectorCache.FileInput.value, langEnumObj, isFrag );
        }
    }

    /**
     * handles events from input[type:file] and file drops, only the first file will be read in as text
     * and passed to the specified callback function
     *
     * param e: event which holds filehandles in e.dataTransfer or e.target.files
     * param onLoadCallback: function that will be called when all filecontent is read as text
    */
    function handleFileSelect( e, onLoadCallback : Function )
    {
        e.stopPropagation();
        e.preventDefault();

        let file;
        if( e.dataTransfer != null && e.dataTransfer.files != null && e.dataTransfer.files[0] != null )
        {
            file = e.dataTransfer.files[0];
        }
        else if ( e.target.files != null && e.target.files[0] != null )
        {
            file = e.target.files[0];
        }
        else { return; }
        // _____________________________________________________________________

        const reader = new FileReader();
        reader.onload = function(){
            onLoadCallback(reader.result);
        };
        reader.readAsText( file );
    }

    //! prevents default drag over action
    function handleDragOver( e )
    {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    //! Sets a given string as value to the ConfigInput Text area, sets the updateTarget
    function setConfigInputText( text : string )
    {
        SelectorCache.ConfigInput.value = text;
        updateSource = UpdateSource.ConfigInput;
    }

    //! Sets a given string as value to the FileInput Text area, calls formatFile();
    function setFileInputText( text : string )
    {
        SelectorCache.FileInput.value = text;
        processFile();
    }

    function processGetParam()
    {
        const urlSplit = window.location.href.split('?', 2);
        if(urlSplit.length < 2)
        {
            return;
        }
        const kvPairs = urlSplit[1].split('&');
        if(kvPairs.length == 1 && kvPairs[0] === '')
        {
            return;
        }

        const param = {
            tab: "tab",
            config: "config",
            file: "file",
            option: "option",
            setting: "setting",
            example: "example",
        };
        let paramMap = new Map<string, string>();

        for(const pair of kvPairs)
        {
            const kvArray = pair.split('=', 2);

            if(kvArray.length < 2)
            {
                continue;
            }
            const p_key = decodeURI(kvArray[0]);
            const p_value = decodeURI(kvArray[1]);
            paramMap.set(p_key, p_value);
        }


        if(paramMap.has(param.config))
        {
            let txt = "";
            try
            {
                txt = atob(decodeURIComponent(paramMap.get(param.config)));
            }
            catch(e){/*ignore*/}
            if(txt !== "") {setConfigInputText(txt);}
        }
        if(paramMap.has(param.file))
        {
            let txt = "";
            try
            {
                txt = atob(decodeURIComponent(paramMap.get(param.file)));
            }
            catch(e){/*ignore*/}
            if(txt !== "") {setFileInputText(txt);}
        }
        if(paramMap.has(param.tab))
        {
            const tabNr = parseInt(paramMap.get(param.tab));
            openTab(tabNr);
        }
        if(paramMap.has(param.option))
        {
            const optionName = paramMap.get(param.option);
            const label = document.querySelector("label[name="+optionName+"]");
            if(label == null) {return;}

            const option = ViewModel.lookupMap.get(optionName);

            openTab(TabStates.editConfig);
            label.scrollIntoView();

            if(paramMap.has(param.setting))
            {
                option.value(paramMap.get(param.setting));
            }
            if(paramMap.has(param.example))
            {
                let txt = "";
                try
                {
                    txt = atob(decodeURIComponent(paramMap.get(param.example)));
                }
                catch(e){/*ignore*/}

                if(txt !== "")
                {
                    editorSession.setValue(txt);

                    SelectorCache.ExampleEditorBox.classList.add( "custom" );
                    customExampleUsed = true;
                    editorChanged = false;

                    option.resetCallback(option);
                }
            }
        }
    }

    //! assigns needed event handlers to the html nodes
    function assignEvents()
    {
        // region tabs
        const tabLen: number = SelectorCache.Tabs.length;
        for( let i: number = 0; i < tabLen; i++ )
        {
            SelectorCache.Tabs[i].onclick = () => openTab( i );
        }
        // endregion

        SelectorCache.ConfigInput.onchange = function()
        {
            updateSource = UpdateSource.ConfigInput;
        };

        SelectorCache.ConfigOutput.onchange = function()
        {
            updateSource = UpdateSource.ConfigOutput;
        };

        SelectorCache.ConfigOutputWithDoc.onchange      = printSettings;
        SelectorCache.ConfigOutputOnlyNDefault.onchange = printSettings;
        SelectorCache.FileInput.onchange = processFile;

        ViewModel.isFragment.subscribe( processFile );
        ViewModel.fileLang.subscribe( processFile );

        // region fileIO textarea orientation
        const orientationBtnImg = <HTMLImageElement> document.getElementById( "orientationBtn" );
        orientationBtnImg.onclick = function(): void {
            const oBtnClsList = orientationBtnImg.classList;
            if( oBtnClsList.contains("rotate") )
            {
                oBtnClsList.remove("rotate");
                SelectorCache.TabContainers[TabStates.fileIO].classList.remove("rotate");
            }
            else
            {
                oBtnClsList.add("rotate");
                SelectorCache.TabContainers[TabStates.fileIO].classList.add("rotate");
            }
            // reset textarea size to always be able to see both after a switch
            // (chromium behaves sometimes faulty if a textarea was resized)
            SelectorCache.FileInput.style.width   = "";
            SelectorCache.FileInput.style.height  = "";
            SelectorCache.FileOutput.style.width  = "";
            SelectorCache.FileOutput.style.height = "";
        };
        // endregion

        // region custom editor example handling
        editorSession.on( "change", function()
        {
            if( !editorFocused ) { return; }
            editorChanged = true;
        } );

        editor.on( "focus", function()
        {
            editorFocused = true;
        } );

        editor.on( "blur", function()
        {
            editorFocused = false;
            if( !editorChanged ) { return; }

            customExampleUsed = editorSession.getValue() !== "";

            if(customExampleUsed)
            {
                SelectorCache.ExampleEditorBox.classList.add( "custom" );
            }
            else
            {
                SelectorCache.ExampleEditorBox.classList.remove( "custom" );
            }

            editorChanged = false;
        } );
        // endregion

        // region drag&drop + input[type:file]
        SelectorCache.ConfigInput.ondragover = handleDragOver;
        SelectorCache.ConfigInput.ondrop = function( e ){
            handleFileSelect( e, setConfigInputText );
        };
        SelectorCache.FileInputConfig.onchange = function( e ){
            handleFileSelect( e, setConfigInputText );
        };

        SelectorCache.FileInput.ondragover = handleDragOver;
        SelectorCache.FileInput.ondrop = function( e ){
            handleFileSelect( e, setFileInputText );
        };
        SelectorCache.FileInputFile.onchange = function( e ){
            handleFileSelect( e, setFileInputText );
        };

        SelectorCache.SaveConfig.onclick = function(){
            fileSaver.saveAs( new Blob( [SelectorCache.ConfigOutput.value], { type : 'text' } ), "uncrustify.cfg", false);
        };
        SelectorCache.SaveFileFormated.onclick = function(){
            fileSaver.saveAs( new Blob( [SelectorCache.FileOutput.value], { type : 'text' } ), "formated", false);
        };
        // endregion

        document.getElementById("output_toggle").onclick = function( e ){
            processFile();
        };
    }

    const ViewModel = new GroupOptionsViewModel();
    buildModel();
    ko.applyBindings( ViewModel );

    assignEvents();

    document.getElementById("version").innerHTML = Uncrustify.get_version();
    processGetParam();
}

